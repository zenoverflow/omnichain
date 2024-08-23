import fs from "fs";
import path from "path";

import type Router from "koa-router";
import { v4 as uuid } from "uuid";

import { globalServerConfig } from "./config.ts";
import { readJsonFile } from "./utils.ts";
import { setupOpenAiCompatibleAPI } from "./openai.ts";
import { callExternalModule } from "./external.ts";

import type { ExtraAction } from "../src/data/typesExec.ts";
import type { ControlUpdate } from "../src/data/typesExec.ts";
import type {
    ChatMessage,
    ExecutorInstance,
    SerializedGraph,
} from "../src/data/types.ts";
import type { CustomNode } from "../src/data/typesCustomNodes.ts";

import {
    StatefulObservable,
    SimpleObservable,
} from "../src/util/ObservableUtils.ts";
import { EngineUtils } from "../src/util/EngineUtils.ts";

// State

const executorStorage = new StatefulObservable<ExecutorInstance | null>(null);

const notificationObservable = new SimpleObservable<{
    type: "info" | "error";
    text: string;
    ts: number;
    duration: number | null;
    graphId?: string;
    nodeId?: string;
}>();

const controlObservable = new SimpleObservable<ControlUpdate>();

const externalActionObservable = new SimpleObservable<ExtraAction>();

// Utils

const isGraphActive = (id: string): boolean => {
    return executorStorage.get()?.graphId === id;
};

const updateActiveNode = (graphId: string, nodeId: string) => {
    const storage = executorStorage.get();
    if (storage?.graphId !== graphId) return;
    if (storage.step === nodeId) return;
    executorStorage.set({
        ...storage,
        step: nodeId,
    });
};

const events: { type: string; data: any }[] = [];
const messageQueue: ChatMessage[] = [];

const handleChatBlock = (blocked: boolean) => {
    const storage = executorStorage.get();
    if (!storage) return;
    executorStorage.set({
        ...storage,
        chatBlocked: blocked,
    });
};

const addMessageToSession = (message: ChatMessage) => {
    const storage = executorStorage.get();
    if (!storage) return;
    executorStorage.set({
        ...storage,
        sessionMessages: [...storage.sessionMessages, message],
    });
};

const saveGraph = async (dirData: string, graph: SerializedGraph) => {
    const graphPath = path.join(dirData, "chains", `${graph.graphId}.json`);
    await new Promise((resolve, reject) => {
        fs.writeFile(graphPath, JSON.stringify(graph), (err) => {
            if (err) reject(err);
            else resolve(null);
        });
    });
};

const stopCurrentGraph = () => {
    if (!executorStorage.get()) return;
    executorStorage.set(null);
    while (messageQueue.length) messageQueue.pop();
    console.log("Stopped current graph");
};

const getApiKeyByName = (dirData: string, name: string): string | null => {
    const apiKeyPath = path.join(dirData, "apiKeys.json");
    if (!fs.existsSync(apiKeyPath)) return null;

    const apiKeys = JSON.parse(fs.readFileSync(apiKeyPath, "utf-8"));

    const target = Object.values(apiKeys as Record<string, any>).find(
        (k: Record<string, any>) => k.name === name
    )?.content as string | null;

    return target || null;
};

const runGraph = async (graphId: string) => {
    // Do nothing if already running
    if (isGraphActive(graphId)) return;

    // Ensure other graph is stopped
    stopCurrentGraph();

    const { nodeRegistry, dirData } = globalServerConfig;

    const graphPath = path.join(dirData, "chains", `${graphId}.json`);

    const _exec: {
        graph: SerializedGraph;
        currentMessage?: ChatMessage | null;
        chatStores: Record<string, ChatMessage[]>;
    } = {
        graph: readJsonFile(graphPath) as SerializedGraph,
        currentMessage: null,
        chatStores: {},
    };

    const saveOption = _exec.graph.execPersistence;

    // Ensure nodes availability in registry
    if (
        _exec.graph.nodes.find(
            (n) => !(nodeRegistry[n.nodeType] as CustomNode | undefined)
        )
    ) {
        const errText = "Tried to execute a graph with missing custom nodes!";
        notificationObservable.next({
            type: "error",
            duration: null,
            ts: Date.now(),
            text: errText,
        });
        console.error("Error: " + errText);
        return;
    }

    // Ensure entrypoint presence
    if (!_exec.graph.nodes.find((n) => n.nodeType === "StartNode")) {
        const errText = "The Chain needs an Entrypoint to start execution!";
        notificationObservable.next({
            type: "error",
            duration: null,
            ts: Date.now(),
            text: errText,
        });
        console.error("Error: " + errText);
        return;
    }

    const instanceId = uuid();

    executorStorage.set({
        graphId: _exec.graph.graphId,
        execId: instanceId,
        sessionMessages: [],
        startTs: Date.now(),
        step: null,
    });

    const getFlowActive = () => {
        return (
            isGraphActive(_exec.graph.graphId) &&
            instanceId === executorStorage.get()?.execId
        );
    };

    console.log("Running graph", _exec.graph.graphId);
    console.log("Graph save mode", saveOption);

    // Execute
    void EngineUtils.runGraph(
        {
            graphId: _exec.graph.graphId,
            instanceId,
            getGraph: () => _exec.graph,
            onEvent(event) {
                if (!getFlowActive()) return;

                const { type, text } = event;
                notificationObservable.next({
                    type: type as "info" | "error",
                    text,
                    ts: Date.now(),
                    duration: 10,
                });
            },
            // Will be replaced by the real implementation
            // when used by EngineUtils
            async fetchInputs(_nodeId) {
                return {};
            },
            async updateControl(node, control, value) {
                if (!getFlowActive()) {
                    throw new Error(
                        "Executor: control change signalled on inactive instance!"
                    );
                }

                // Update current graph
                const update = {
                    ..._exec.graph,
                    nodes: _exec.graph.nodes.map((n) => {
                        if (n.nodeId !== node) return n;
                        return {
                            ...n,
                            controls: {
                                ...n.controls,
                                [control]: value,
                            },
                        };
                    }),
                };
                _exec.graph = update;
                // Save to disk if needed
                if (saveOption !== "onDemand") {
                    await saveGraph(dirData, _exec.graph);
                }
                // Notify frontend
                controlObservable.next({ graphId, node, control, value });
            },
            async extraAction(action) {
                if (!getFlowActive()) {
                    throw new Error(
                        "Executor: External action called on inactive instance!"
                    );
                }

                // console.log("onExternalAction", action);

                let result: any = null;

                switch (action.type) {
                    case "callExternalModule":
                        result = await callExternalModule(
                            action.args.module,
                            action.args.action,
                            action.args.data
                        );
                        break;
                    case "chatBlock":
                        handleChatBlock(action.args.blocked);
                        break;
                    case "checkQueue":
                        result = messageQueue;
                        break;
                    case "readSessionMessages":
                        result = executorStorage.get()?.sessionMessages || [];
                        break;
                    case "grabNextMessage":
                        _exec.currentMessage =
                            messageQueue.shift() as ChatMessage | null;
                        break;
                    case "readCurrentMessage":
                        result = _exec.currentMessage;
                        break;
                    case "addMessageToSession":
                        addMessageToSession(action.args.message);
                        break;
                    case "saveGraph":
                        await saveGraph(dirData, _exec.graph);
                        break;
                    case "mkChatStore":
                        result = (() => {
                            const storeId = uuid();
                            _exec.chatStores[storeId] = [];
                            return storeId;
                        })();
                        break;
                    case "getChatStore":
                        result = _exec.chatStores[action.args.id];
                        break;
                    case "addMessageToChatStore":
                        _exec.chatStores[action.args.id].push(
                            action.args.message
                        );
                        break;
                    case "rmChatStore":
                        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                        delete _exec.chatStores[action.args.id];
                        break;
                    case "clearSession":
                        (() => {
                            const storage = executorStorage.get();
                            if (!storage) return;
                            executorStorage.set({
                                ...storage,
                                sessionMessages: [],
                            });
                        })();
                        break;
                    case "reduceSession":
                        (() => {
                            const storage = executorStorage.get();
                            if (!storage) return;
                            const n = action.args.n;
                            executorStorage.set({
                                ...storage,
                                sessionMessages: storage.sessionMessages.slice(
                                    -n
                                ),
                            });
                        })();
                        break;
                    default:
                        externalActionObservable.next(action);
                        break;
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return result;
            },
            getAllControls(nodeId) {
                const controls = _exec.graph.nodes.find(
                    (n) => n.nodeId === nodeId
                )?.controls;
                return controls || {};
            },
            // Will be replaced by the real implementation
            // when used by EngineUtils
            getControlsWithOverride(_nodeId, _nodeInputs) {
                return {};
            },
            getApiKeyByName(name) {
                return getApiKeyByName(dirData, name);
            },
            getFlowActive,
        },
        nodeRegistry,
        {
            onFlowNode(nodeId) {
                if (!getFlowActive()) return;

                updateActiveNode(_exec.graph.graphId, nodeId);
                // console.log(
                //     "Flowing to node",
                //     _exec.graph.nodes.find((n) => n.nodeId === nodeId)?.nodeType
                // );
            },
            // For uncaught errors during execution
            onError(error) {
                const executor = executorStorage.get();
                const graphId = executor?.graphId ?? undefined;
                const nodeId = executor?.step ?? undefined;

                const nodeType = nodeId
                    ? _exec.graph.nodes.find((n) => n.nodeId === nodeId)
                          ?.nodeType ?? undefined
                    : undefined;

                const text = nodeType
                    ? `${nodeType}: ${error.message}`
                    : error.message;

                notificationObservable.next({
                    type: "error",
                    text,
                    ts: Date.now(),
                    duration: null,
                    graphId,
                    nodeId,
                });

                stopCurrentGraph();
                console.error("--UNCAUGHT ERROR--\n", error);
            },
        }
    );
};

// Main logic

export const setupExecutorApi = (router: Router, portOpenAi: number) => {
    const { dirData } = globalServerConfig;

    // Executor connection for ping api
    executorStorage.subscribe((instance) => {
        events.push({
            type: "executorUpdate",
            data: instance,
        });
    });
    notificationObservable.subscribe((notification) => {
        events.push({
            type: "notification",
            data: notification,
        });
    });
    controlObservable.subscribe((update) => {
        events.push({
            type: "controlUpdate",
            data: update,
        });
    });

    router.get("/api/executor/state", async (ctx) => {
        ctx.body = JSON.stringify({ state: executorStorage.get() });
    });

    router.get("/api/executor/ping", async (ctx) => {
        try {
            if (!events.length) {
                ctx.body = "[]";
                return;
            }

            const toSend: typeof events = [];

            while (events.length) {
                const ev = events.shift();
                if (ev) toSend.push(ev);
            }

            ctx.body = JSON.stringify(toSend);
        } catch (error) {
            ctx.body = "[]";
        }
    });

    // Endpoint to stop graph
    router.post("/api/executor/stop", async (ctx) => {
        stopCurrentGraph();
        ctx.body = "OK";
    });

    // Endpoint to send message from the frontend
    router.post("/api/executor/message", async (ctx) => {
        const message = ctx.request.body as ChatMessage;
        messageQueue.push(message);
        console.log(
            "Received message from frontend:",
            message.content,
            "files:",
            message.files.length
        );
        addMessageToSession(message);
        ctx.body = "OK";
    });

    // Endpoints to receive messages from an OpenAI-compatible client
    // Runs as a separate app on a separate port
    setupOpenAiCompatibleAPI(
        portOpenAi,
        async (messages, checkRequestActive, clearSessionOnResponse = true) => {
            const latestMessage = messages[messages.length - 1];
            const chainId = latestMessage.chainId;

            // Ensure the correct chain is running
            await runGraph(chainId);

            for (const message of messages) {
                addMessageToSession(message);
                console.log(
                    "Received message from OAI API:",
                    message.content,
                    "files:",
                    message.files.length
                );
            }

            messageQueue.push(latestMessage);

            // If the graph did not run, something went wrong. Return null.
            if (!executorStorage.get()) return null;

            // Wait for message with the assistant role to appear in the executor session
            let result: ChatMessage | null = null;
            while (checkRequestActive()) {
                const session = executorStorage.get();
                if (!session) break;

                const messages = session.sessionMessages;
                if (messages.length) {
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage.role === "assistant") {
                        result = lastMessage;
                        break;
                    }
                }

                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            if (clearSessionOnResponse) {
                const storage = executorStorage.get();
                if (storage) {
                    executorStorage.set({
                        ...storage,
                        sessionMessages: [],
                    });
                }
            }

            return result;
        }
    );

    // Endpoint to run graph
    router.post("/api/executor/run/:id", async (ctx) => {
        const graphId = ctx.params.id;
        const graphPath = path.join(dirData, "chains", `${graphId}.json`);

        if (!fs.existsSync(graphPath)) {
            ctx.throw(404, "Graph not found");
            return;
        }

        await runGraph(graphId);

        ctx.body = JSON.stringify(executorStorage.get());
    });
};

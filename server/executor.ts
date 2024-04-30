import fs from "fs";
import path from "path";

import type Router from "koa-router";
import { ClassicPreset, NodeEditor } from "rete";
import { ControlFlow, Dataflow } from "rete-engine";

import { readJsonFile, buildNodeRegistry } from "./utils.ts";

import type { ExternalAction } from "../src/nodes/context.ts";

import { ControlUpdate } from "../src/nodes/context.ts";
import {
    StatefulObservable,
    SimpleObservable,
} from "../src/util/ObservableUtils.ts";
import { GraphUtils } from "../src/util/GraphUtils.ts";
import {
    ChatMessage,
    ExecutorInstance,
    SerializedGraph,
} from "../src/data/types.ts";

// State

const executorStorage = new StatefulObservable<ExecutorInstance | null>(null);

const notificationObservable = new SimpleObservable<{
    type: "info" | "error";
    text: string;
    ts: number;
    duration: number;
}>();

const controlObservable = new SimpleObservable<ControlUpdate>();

const externalActionObservable = new SimpleObservable<ExternalAction>();

// Utils

const isGraphActive = (id: string): boolean => {
    return executorStorage.get()?.graphId === id;
};

const updateActiveNode = (graphId: string, nodeId: string) => {
    const storage = executorStorage.get();
    if (storage?.graphId !== graphId) return;
    executorStorage.set({
        ...storage,
        step: nodeId,
    });
};

let events: { type: string; data: any }[] = [];
let currentGraph: SerializedGraph | null = null;

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

const saveCurrentGraph = (dirData: string) => {
    if (currentGraph) {
        const graphPath = path.join(
            dirData,
            "chains",
            `${currentGraph.graphId}.json`
        );
        fs.writeFileSync(graphPath, JSON.stringify(currentGraph));
    }
};

// Main logic

export const setupExecutorApi = (
    router: Router,
    dirData: string,
    dirCustomNodes: string
) => {
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

    const nodeRegistry = buildNodeRegistry(dirCustomNodes);
    const saveOption = fs.existsSync(path.join(dirData, "options.json"))
        ? JSON.parse(
              fs.readFileSync(path.join(dirData, "options.json"), "utf-8")
          ).execPersistence || "onChange"
        : "onChange";

    router.get("/api/executor/state", async (ctx) => {
        ctx.body = JSON.stringify({ state: executorStorage.get() });
    });

    router.get("/api/executor/ping", async (ctx) => {
        const toSend = JSON.stringify(events);
        // console.log("Ping", toSend);
        ctx.body = toSend;
        events = [];
    });

    // Endpoint to stop graph
    router.post("/api/executor/stop", async (ctx) => {
        executorStorage.set(null);
        // Always save graph after execution
        saveCurrentGraph(dirData);
        currentGraph = null;
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
        ctx.body = "OK";
    });

    // Endpoint to run graph
    router.post("/api/executor/run/:id", async (ctx) => {
        const graphId = ctx.params.id;
        const graphPath = path.join(dirData, "chains", `${graphId}.json`);

        if (!fs.existsSync(graphPath)) {
            ctx.throw(404, "Graph not found");
            return;
        }

        let execGraph = readJsonFile(graphPath) as SerializedGraph;
        currentGraph = execGraph;

        // Ensure nodes availability in registry
        if (execGraph.nodes.find((n) => !nodeRegistry[n.nodeType])) {
            notificationObservable.next({
                type: "error",
                duration: 3,
                ts: Date.now(),
                text: "Tried to execute a graph with missing custom nodes!",
            });
            return;
        }

        // Ensure entrypoint presence
        if (!execGraph.nodes.find((n) => n.nodeType === "StartNode")) {
            notificationObservable.next({
                type: "error",
                duration: 3,
                ts: Date.now(),
                text: "The Chain needs an Entrypoint to start execution!",
            });
            return;
        }

        executorStorage.set({
            graphId: execGraph.graphId,
            sessionMessages: [],
            startTs: Date.now(),
            step: null,
        });

        // Headless editor
        const editor = new NodeEditor<any>();
        const control = new ControlFlow(editor);
        const dataflow = new Dataflow(editor);

        // Hydrate
        await GraphUtils.hydrate(
            execGraph,
            {
                headless: true,
                graphId: execGraph.graphId,
                editor,
                control,
                dataflow,
                onEvent(event) {
                    const { type, text } = event;
                    notificationObservable.next({
                        type: type as "info" | "error",
                        text,
                        ts: Date.now(),
                        duration: 3,
                    });
                },
                onError(error) {
                    notificationObservable.next({
                        type: "error",
                        text: error.message,
                        ts: Date.now(),
                        duration: 3,
                    });
                },
                onAutoExecute(nodeId) {
                    if (!isGraphActive(execGraph.graphId)) return;
                    control.execute(nodeId);
                },
                onFlowNode(nodeId) {
                    if (!isGraphActive(execGraph.graphId)) return;
                    updateActiveNode(execGraph.graphId, nodeId);
                },
                onControlChange(graphId, node, control, value) {
                    // updateNodeControl(graphId, node, control, value);
                    // Update current graph
                    if (saveOption === "onChange") {
                        const update = {
                            ...execGraph,
                            nodes: execGraph.nodes.map((n) => {
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
                        execGraph = update;
                        currentGraph = update;
                        fs.writeFileSync(graphPath, JSON.stringify(update));
                    }
                    controlObservable.next({ graphId, node, control, value });
                },
                async onExternalAction(action) {
                    console.log("External action", action);

                    let result: any;

                    switch (action.type) {
                        case "chatBlock":
                            handleChatBlock(action.args.blocked);
                            break;
                        case "terminal":
                            // TODO: implement via backend
                            break;
                        case "readMessage":
                            result = messageQueue.shift();
                            break;
                        case "addMessageToSession":
                            addMessageToSession(action.args.message);
                            break;
                        case "saveGraph":
                            saveCurrentGraph(dirData);
                            break;
                        default:
                            externalActionObservable.next(action);
                            break;
                    }

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return result;
                },
                getControlObservable() {
                    return controlObservable;
                },
                getControlDisabledObservable() {
                    return null;
                },
                getControlValue(_graphId, node, control) {
                    // const graph = graphStorage.get()[graphId];
                    return execGraph.nodes.find((n) => n.nodeId === node)
                        ?.controls[control] as string | number | null;
                },
                getControlDisabled(_graphId) {
                    // Always enabled in headless exec
                    return true;
                },
                getIsActive() {
                    return isGraphActive(execGraph.graphId);
                },
                unselect() {
                    // No selection in headless
                },
            },
            nodeRegistry
        );

        const entrypoint = editor
            .getNodes()
            .find((n: ClassicPreset.Node) => n.label === "StartNode");

        control.execute((entrypoint as ClassicPreset.Node).id);

        ctx.body = JSON.stringify(executorStorage.get());
    });
};

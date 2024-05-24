import type { ChatMessage, ExecutorInstance } from "../data/types";

import { StatefulObservable } from "../util/ObservableUtils";
import { updateNodeControl, pullSingleGraph } from "./graphs";
import { controlObservable } from "./watcher";
import { showNotification } from "./notifications";
import { ExecutorUtils } from "../util/ExecutorUtils";
import { QueueUtils } from "../util/QueueUtils";
import { MsgUtils } from "../util/MsgUtils";
import { finishGlobalLoading, startGlobalLoading } from "./loader";

export const executorStorage = new StatefulObservable<ExecutorInstance | null>(
    null
);

export const lastNodeErrorStorage = new StatefulObservable<{
    graphId: string;
    nodeId: string;
    error: string;
} | null>(null);

export const clearLastNodeError = () => {
    lastNodeErrorStorage.set(null);
};

const pullOnStop = async (graphId: string) => {
    // const executor = executorStorage.get();
    // if (!executor) return;
    // const graphId = executor.graphId;

    startGlobalLoading();

    // Refresh the graph due to possible discrepancies
    // if execPersistence was not set to onChange
    // and no SaveState node was used.
    await pullSingleGraph(graphId);

    finishGlobalLoading();
};

const updateChecker = async () => {
    // let messages: { type: string; data: any }[] = [];
    try {
        const messages = await ExecutorUtils.pingExecutor();
        for (const message of messages) {
            switch (message.type) {
                case "executorUpdate":
                    // console.log("Executor update", message.data);
                    // if (!message.data && !!executorStorage.get()) {
                    //     // console.log("Executor stopped");
                    //     await pullOnStop();
                    // }
                    executorStorage.set(message.data);
                    break;
                case "notification":
                    showNotification(message.data);
                    if (message.data.type === "error") {
                        lastNodeErrorStorage.set({
                            graphId: message.data.graphId,
                            nodeId: message.data.nodeId,
                            error: message.data.text,
                        });
                    }
                    break;
                case "controlUpdate":
                    await updateNodeControl(
                        message.data.graphId,
                        message.data.node,
                        message.data.control,
                        message.data.value,
                        false // do not save, change is from backend
                    );
                    controlObservable.next(message.data);
                    break;
                default:
                    break;
            }
        }
    } catch (error) {
        console.error(error);
    }
    setTimeout(() => {
        if (executorStorage.get()) {
            void updateChecker();
        }
    }, 50);
};

export const isGraphActive = (id: string): boolean => {
    return executorStorage.get()?.graphId === id;
};

export const stopGraph = async () => {
    const graphId = executorStorage.get()?.graphId;
    if (!graphId) return;

    await ExecutorUtils.stopGraph();
    await pullOnStop(graphId);
};

export const runGraph = async (graphId: string) => {
    clearLastNodeError();

    // Wait for all queued tasks to finish
    // This ensures updates are complete before running the graph
    while (QueueUtils.busy()) {
        await new Promise((r) => setTimeout(r, 100));
    }

    const executorUpdate = await ExecutorUtils.runGraph(graphId);
    executorStorage.set(executorUpdate as any);

    void updateChecker();
};

export const addUserMessage = (
    chainId: string,
    content: string,
    from: string | null = null,
    files: ChatMessage["files"] = []
) => {
    QueueUtils.addTask(async () => {
        const created = MsgUtils.freshFromUser(
            chainId,
            content.trim(),
            from,
            files
        );
        startGlobalLoading();
        await ExecutorUtils.sendMessage(created);
        finishGlobalLoading();
    });
};

export const loadExecutor = async () => {
    const state = await ExecutorUtils.getState();
    executorStorage.set(state as any);
    if (state) {
        void updateChecker();
    }
};

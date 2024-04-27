import { StatefulObservable } from "../util/ObservableUtils";
import { updateNodeControl } from "./graphs";
import { controlObservable } from "./watcher";
import { showNotification } from "./notifications";
import { ExecutorUtils } from "../util/ExecutorUtils";

export type ExecutorInstance = {
    graphId: string;
    startTs?: number | null;
    step?: string | null;
};

export const executorStorage = new StatefulObservable<ExecutorInstance | null>(
    null
);

const updateChecker = async () => {
    // let messages: { type: string; data: any }[] = [];
    try {
        const messages = await ExecutorUtils.pingExecutor();
        for (const message of messages) {
            switch (message.type) {
                case "executorUpdate":
                    executorStorage.set(message.data);
                    // console.log("Executor update", message.data);
                    break;
                case "notification":
                    showNotification(message.data);
                    break;
                case "controlUpdate":
                    updateNodeControl(
                        message.data.graphId,
                        message.data.node,
                        message.data.control,
                        message.data.value,
                        false // do not save, already saved
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

let indicatorLock = false;

const unmarkAllNodes = () => {
    document
        .querySelectorAll("[data-exec-graph]")
        .forEach((e) => ((e as HTMLElement).style.display = "none"));
};

const markActiveNode = (force = false) => {
    if (indicatorLock && !force) return;
    indicatorLock = true;

    unmarkAllNodes();

    const currentExec = executorStorage.get();

    if (!currentExec) {
        indicatorLock = false;
        return;
    }

    try {
        if (currentExec.step) {
            const query = [
                `[data-exec-graph="${currentExec.graphId}"]`,
                `[data-exec-node="${currentExec.step}"]`,
            ].join("");

            const tNode: HTMLElement | null = document.querySelector(query);

            if (tNode) {
                tNode.style.display = "block";
            }
        }
    } catch (error) {
        console.error(error);
    }

    setTimeout(() => {
        markActiveNode(true);
    }, 250);
};

export const stopGraph = () => {
    void ExecutorUtils.stopGraph();
};

export const runGraph = async (graphId: string) => {
    const executorUpdate = await ExecutorUtils.runGraph(graphId);
    executorStorage.set(executorUpdate as any);
    markActiveNode();

    void updateChecker();
};

export const loadExecutor = async () => {
    const state = await ExecutorUtils.getState();
    executorStorage.set(state as any);
    if (state) {
        markActiveNode();
        void updateChecker();
    }
};

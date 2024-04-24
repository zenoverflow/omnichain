import { ClassicPreset, NodeEditor } from "rete";
import { ControlFlow, Dataflow } from "rete-engine";

import { StatefulObservable } from "../util/ObservableUtils";
import { GraphUtils } from "../util/GraphUtils";
import { graphStorage, updateNodeControl } from "./graphs";
import { controlObservable } from "./watcher";
import { showNotification } from "./notifications";
import { nodeRegistryStorage } from "./nodeRegistry";

export type ExecutorInstance = {
    graphId: string;
    startTs?: number | null;
    step?: string | null;
};

export const executorStorage = new StatefulObservable<ExecutorInstance | null>(
    null
);

export const isGraphActive = (id: string): boolean => {
    return executorStorage.get()?.graphId === id;
};

export const updateActiveNode = (graphId: string, nodeId: string) => {
    const storage = executorStorage.get();
    if (storage?.graphId !== graphId) return;
    executorStorage.set({
        ...storage,
        step: nodeId,
    });
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
    executorStorage.set(null);
};

export const runGraph = async (graphId: string) => {
    const graph = graphStorage.get()[graphId];

    // Ensure nodes availability in registry
    if (graph.nodes.find((n) => !nodeRegistryStorage.get()[n.nodeType])) {
        showNotification({
            type: "error",
            duration: 3,
            ts: Date.now(),
            text: "Tried to execute a graph with missing custom nodes!",
        });
        return;
    }

    // Ensure entrypoint presence
    if (!graph.nodes.find((n) => n.nodeType === "StartNode")) {
        showNotification({
            type: "error",
            duration: 3,
            ts: Date.now(),
            text: "The Chain needs an Entrypoint to start execution!",
        });
        return;
    }

    executorStorage.set({
        graphId: graph.graphId,
        startTs: Date.now(),
        step: null,
    });

    // Headless editor
    const editor = new NodeEditor<any>();
    const control = new ControlFlow(editor);
    const dataflow = new Dataflow(editor);

    // Hydrate
    await GraphUtils.hydrate(
        graph,
        {
            headless: true,
            graphId: graph.graphId,
            editor,
            control,
            dataflow,
            onEvent(event) {
                const { type, text } = event;
                showNotification({
                    type,
                    text,
                    ts: Date.now(),
                    duration: 3,
                });
            },
            onError(error) {
                showNotification({
                    type: "error",
                    text: error.message,
                    ts: Date.now(),
                    duration: 3,
                });
            },
            onAutoExecute(nodeId) {
                if (!isGraphActive(graph.graphId)) return;
                control.execute(nodeId);
            },
            onFlowNode(nodeId) {
                if (!isGraphActive(graph.graphId)) return;
                updateActiveNode(graph.graphId, nodeId);
            },
            onControlChange(graphId, node, control, value) {
                updateNodeControl(graphId, node, control, value);
                controlObservable.next({ graphId, node, control, value });
            },
            getControlObservable() {
                return controlObservable;
            },
            getControlValue(graphId, node, control) {
                const graph = graphStorage.get()[graphId];
                return graph.nodes.find((n) => n.nodeId === node)?.controls[
                    control
                ] as string | number | null;
            },
            getIsActive() {
                return isGraphActive(graph.graphId);
            },
            unselect() {
                // No selection in headless
            },
        },
        nodeRegistryStorage.get()
    );

    setTimeout(() => {
        try {
            const entrypoint = editor
                .getNodes()
                .find((n: ClassicPreset.Node) => n.label === "StartNode");

            control.execute((entrypoint as ClassicPreset.Node).id);

            markActiveNode();
        } catch (error) {
            showNotification({
                type: "error",
                text: (error as Error).message,
                ts: Date.now(),
                duration: 3,
            });
        }
    }, 3);
};

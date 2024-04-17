import { ClassicPreset, NodeEditor } from "rete";
import { ControlFlow, Dataflow } from "rete-engine";

import { StatefulObservable } from "../util/ObservableUtils";
import { graphStorage, updateNodeControl } from "./graphs";
import { controlObservable } from "./watcher";
import { showNotification } from "./notifications";
import { GraphUtils } from "../util/GraphUtils";
import { SerializedGraph } from "../data/types";

export type ExecutorInstance = {
    graphId: string;
    startTs: number;
    step: string | null;
};

export const executorStorage = new StatefulObservable<
    Record<string, ExecutorInstance>
>({});

export const isGraphActive = (id: string): boolean => {
    return !!executorStorage.get()[id];
};

export const updateActiveNode = (graphId: string, execId: string) => {
    const storage = executorStorage.get();
    executorStorage.set({
        ...storage,
        [graphId]: {
            ...storage[graphId],
            step: execId,
        },
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

    const execInstances = Object.values(executorStorage.get());

    if (!execInstances.length) {
        indicatorLock = false;
        return;
    }

    try {
        const targets: string[] = [];

        for (const inst of execInstances) {
            if (!inst.step) continue;

            targets.push(
                [
                    `[data-exec-graph="${inst.graphId}"]`,
                    `[data-exec-node="${inst.step}"]`,
                ].join("")
            );
        }
        for (const query of targets) {
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

export const stopGraph = (graphId: string) => {
    executorStorage.set(
        Object.fromEntries(
            Object.entries(executorStorage.get()).filter(
                ([key]) => key !== graphId
            )
        )
    );
};

export const runGraph = async (graphId: string) => {
    const target = graphStorage.get()[graphId] as SerializedGraph | null;

    if (!target) return;

    // Ensure entrypoint presence
    const triggers = target.nodes.filter((n) => n.nodeType === "StartNode");

    if (!triggers.length) {
        showNotification({
            type: "error",
            duration: 3,
            ts: Date.now(),
            text: "The Chain needs an Entrypoint to start execution!",
        });
        return;
    }

    executorStorage.set({
        ...executorStorage.get(),
        [graphId]: {
            graphId,
            startTs: Date.now(),
            step: null,
        },
    });

    // Headless editor
    const editor = new NodeEditor<any>();
    const control = new ControlFlow(editor);
    const dataflow = new Dataflow(editor);

    // Hydrate
    await GraphUtils.hydrate(target, {
        headless: true,
        graphId,
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
            if (!isGraphActive(graphId)) return;
            control.execute(nodeId);
        },
        onFlowNode(nodeId) {
            if (!isGraphActive(graphId)) return;
            updateActiveNode(graphId, nodeId);
        },
        onControlChange(graphId, node, control, value) {
            updateNodeControl(graphId, node, control, value);
            controlObservable.next({ graphId, node, control, value });
        },
        getControlObservable() {
            return controlObservable;
        },
        getControlValue(graphId, node, control) {
            const s = graphStorage.get();
            const graph = s[graphId] as SerializedGraph | null;
            if (!graph) return null;
            return graph.nodes.find((n) => n.nodeId === node)?.controls[
                control
            ] as string | number | null;
        },
        getIsActive() {
            return isGraphActive(graphId);
        },
        unselect() {
            // No selection in headless
        },
    });

    try {
        // Work one-time auto triggers
        const targets = ["StartNode"];
        const triggerNodes = editor
            .getNodes()
            .filter((n: ClassicPreset.Node) => targets.includes(n.label));

        for (const trigger of triggerNodes) {
            setTimeout(() => {
                control.execute((trigger as ClassicPreset.Node).id);
            });
        }

        // Keep highlight on active node
        markActiveNode();
    } catch (error) {
        showNotification({
            type: "error",
            text: (error as Error).message,
            ts: Date.now(),
            duration: 3,
        });
    }
};

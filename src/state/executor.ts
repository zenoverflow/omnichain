import { atom } from "jotai";
import { NodeEditor } from "rete";
import { ControlFlow, Dataflow } from "rete-engine";

import { appStore } from ".";
import { graphStorageAtom, updateNodeControl } from "./graphs";
import { controlObservable } from "./watcher";
import { showNotification } from "./notifications";
import { GraphUtils } from "../util/GraphUtils";

type ExecutorInstance = {
    graphId: string;
    startTs: number;
    step: string | null;
};

const _executorAtom = atom<Record<string, ExecutorInstance>>({});

export const executorAtom = atom((get) => ({ ...get(_executorAtom) }));

export const isGraphActive = (id: string): boolean => {
    const executor = appStore.get(executorAtom);
    return !!executor[id];
};

export const updateActiveNode = (graphId: string, execId: string) => {
    const s = appStore.get(_executorAtom);
    appStore.set(_executorAtom, {
        ...s,
        [graphId]: {
            ...s[graphId],
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

    const execInstances = Object.values(appStore.get(_executorAtom));

    if (!execInstances.length) {
        indicatorLock = false;
        return;
    }

    try {
        const targets: string[] = [];

        for (const inst of execInstances) {
            if (!inst.step) continue;

            targets.push(
                `${[
                    `[data-exec-graph="${inst.graphId}"]`,
                    `[data-exec-node="${inst.step}"]`,
                ].join("")}`
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

    setTimeout(() => markActiveNode(true), 250);
};

export const stopGraph = (graphId: string) => {
    appStore.set(
        _executorAtom,
        Object.fromEntries(
            Object.entries(appStore.get(_executorAtom)).filter(
                ([key]) => key !== graphId
            )
        )
    );
};

export const runGraph = async (graphId: string) => {
    const target = appStore.get(graphStorageAtom)[graphId];

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

    if (!target) return;

    appStore.set(_executorAtom, {
        ...appStore.get(_executorAtom),
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
                text: (error as Error).message,
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
            .filter((n) => targets.includes(n.label));
        for (const trigger of triggerNodes) {
            setTimeout(() => {
                control.execute(trigger.id);
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

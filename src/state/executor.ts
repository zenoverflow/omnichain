import { atom } from "jotai";
import { NodeEditor } from "rete";
import { ControlFlow, Dataflow } from "rete-engine";

import { appStore } from ".";
import { graphStorageAtom, updateNodeControl } from "./graphs";
import { showNotification } from "./notifications";
import { GraphUtils } from "../util/GraphUtils";
import { StartNode } from "../nodes/";

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

            const execPieces = inst.step.split("__");

            // Node in main graph
            if (execPieces.length === 1) {
                targets.push(
                    `${[
                        `[data-exec-graph="${inst.graphId}"]`,
                        `[data-exec-node="${execPieces[0]}"]`,
                    ].join("")}`
                );
            }
            // Node in module
            else if (execPieces.length === 3) {
                const [moduleNodeId, moduleId, nodeId] = execPieces;
                // Module node in main graph
                targets.push(
                    `${[
                        `[data-exec-graph="${inst.graphId}"]`,
                        `[data-exec-node="${moduleNodeId}"]`,
                        `[data-exec-is-module-node="1"]`,
                        `[data-exec-is-module-node-val="${moduleId}"]`,
                    ].join("")}`
                );
                // Node in module
                targets.push(
                    `${[
                        `[data-exec-graph="${inst.graphId}"]`,
                        `[data-exec-module="${moduleId}"]`,
                        `[data-exec-node="${nodeId}"]`,
                    ].join("")}`
                );
            }
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

export const stopGraph = (id: string) => {
    appStore.set(
        _executorAtom,
        Object.fromEntries(
            Object.entries(appStore.get(_executorAtom)).filter(
                ([key]) => key !== id
            )
        )
    );
};

export const runGraph = async (graphId: string) => {
    const target = appStore.get(graphStorageAtom)[graphId];

    // Ensure entrypoint presence
    const triggers = target.nodes.filter((n) => n.nodeType === StartNode.name);

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
        headless: false,
        pathToGraph: [graphId],
        editor,
        control,
        dataflow,
        getModuleOptions() {
            /*
            No graphical inputs in headless mode
            Also value is set programmatically
            on a higher-level object.
            */
            return [];
        },
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
        onFlowNode(execId) {
            if (!isGraphActive(graphId)) return;
            updateActiveNode(graphId, execId);
        },
        onControlChange(pathToGraph, node, control, value) {
            updateNodeControl(pathToGraph, node, control, value);
        },
        getIsActive() {
            return isGraphActive(graphId);
        },
        unselect() {
            //
        },
    });

    try {
        // Work one-time auto triggers
        const targets = Object.keys({
            StartNode,
        });
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

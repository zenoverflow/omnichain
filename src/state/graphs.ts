import { atom } from "jotai";
import { NodeEditor } from "rete";
import { AreaPlugin } from "rete-area-plugin";

import { appStore } from ".";
import { GraphUtils } from "../util/GraphUtils";
import { QueueUtils } from "../util/QueueUtils";
import { db } from "../data/db";
import { SerializedGraph } from "../data/types";
import { NodeContextObj } from "../nodes/context";
import { openPath } from "./editor";
import { clearRedundantOptions } from "./options";

const _graphStorageAtom = atom<Record<string, SerializedGraph>>({});

export const graphStorageAtom = atom((get) => ({ ...get(_graphStorageAtom) }));

export const loadGraphsFromDb = async () => {
    appStore.set(
        _graphStorageAtom,
        Object.fromEntries(
            (await db.chains.toArray()).map((c) => [c.graphId, c])
        )
    );
};

export const listGraphModules = (graphId: string) => {
    const g = appStore.get(_graphStorageAtom)[graphId];
    if (!g) return [];
    return Object.values(g.modules).map((m) => ({
        label: m.name,
        value: [graphId, m.graphId],
    }));
};

// ACTIONS //

export const createGraph = (name?: string, parentId?: string) => {
    QueueUtils.addTask(async () => {
        const s = appStore.get(_graphStorageAtom);
        // main graph
        if (!parentId) {
            const created = GraphUtils.empty(name ?? "New Chain");
            const id = created.graphId;
            appStore.set(_graphStorageAtom, {
                ...s,

                [id]: created,
            });
            await db.chains.add(created);
            openPath([id]);
        }
        // module of graph
        else {
            const parent = s[parentId];
            const created = GraphUtils.empty(name ?? "New Module");
            const id = created.graphId;

            const update: SerializedGraph = {
                ...parent,
                modules: {
                    ...parent.modules,
                    [id]: created,
                },
            };

            appStore.set(_graphStorageAtom, {
                ...s,
                [parentId]: update,
            });

            await db.chains.put(update);
            openPath([parentId, id]);
        }
    });
};

export const initGraph = async (context: NodeContextObj) => {
    const { pathToGraph: path } = context;
    // main graph
    if (path.length === 1) {
        const id = path[0];
        await GraphUtils.hydrate(appStore.get(_graphStorageAtom)[id], context);
    }
    // module of graph
    else if (path.length === 2) {
        const [parentId, targetId] = path;

        await GraphUtils.hydrate(
            appStore.get(_graphStorageAtom)[parentId].modules[targetId],
            context
        );
    }
};

export const updateGraph = (
    editor: NodeEditor<any>,
    area: AreaPlugin<any, any>,
    path: string[],
    callSource?: string // for debug only
) => {
    QueueUtils.addTask(async () => {
        console.log("UPDATE GRAPH", callSource ?? "somewhere");
        const s = appStore.get(_graphStorageAtom);
        // main graph
        if (path.length === 1) {
            const id = path[0];

            const target = s[id];

            const update = GraphUtils.serializeFromEditor(
                editor,
                area,
                // preserve metadata
                target
            );
            appStore.set(_graphStorageAtom, {
                ...s,
                [id]: update,
            });
            await db.chains.put(update);
        }
        // module of graph
        else if (path.length === 2) {
            const [parentId, targetId] = path;

            const parent = s[parentId];
            const target = parent.modules[targetId];

            const update: SerializedGraph = {
                ...parent,
                modules: {
                    ...parent.modules,
                    [targetId]: GraphUtils.serializeFromEditor(
                        editor,
                        area,
                        // preserve metadata
                        target
                    ),
                },
            };
            appStore.set(_graphStorageAtom, {
                ...s,

                [parentId]: update,
            });
            await db.chains.put(update);
        }
    });
};

export const updateGraphName = (path: string[], name: string) => {
    QueueUtils.addTask(async () => {
        const s = appStore.get(_graphStorageAtom);
        // main graph
        if (path.length === 1) {
            const id = path[0];
            const target = s[id];

            const update = { ...target, name };
            appStore.set(_graphStorageAtom, {
                ...s,
                [id]: { ...target, name },
            });
            await db.chains.put(update);
        }
        // module of graph
        else if (path.length === 2) {
            const [parentId, targetId] = path;

            const parent = s[parentId];
            const target = parent.modules[targetId];

            const update = {
                ...parent,
                modules: {
                    ...parent.modules,
                    [targetId]: { ...target, name },
                },
            };
            appStore.set(_graphStorageAtom, {
                ...s,

                [parentId]: update,
            });
            await db.chains.put(update);
        }
    });
};

export const updateNodeControl = (
    pathToGraph: string[],
    nodeId: string,
    controlKey: string,
    controlValue: any
) => {
    QueueUtils.addTask(async () => {
        console.log("UPDATE NODE CONTROL");
        const s = appStore.get(_graphStorageAtom);
        // main graph
        if (pathToGraph.length === 1) {
            const id = pathToGraph[0];
            const target = s[id];

            const update = {
                ...target,
                nodes: target.nodes.map((n) => {
                    if (n.nodeId !== nodeId) return n;
                    return {
                        ...n,
                        controls: {
                            ...n.controls,
                            [controlKey]: controlValue,
                        },
                    };
                }),
            };

            console.log("AFTER UPDATE", update);

            appStore.set(_graphStorageAtom, {
                ...s,
                [id]: update,
            });
            await db.chains.put(update);
        }
        // module of graph
        else if (pathToGraph.length === 2) {
            const [parentId, targetId] = pathToGraph;

            const parent = s[parentId];
            const target = parent.modules[targetId];

            const update = {
                ...parent,
                modules: {
                    ...parent.modules,
                    [targetId]: {
                        ...target,
                        nodes: target.nodes.map((n) => {
                            if (n.nodeId !== nodeId) return n;
                            return {
                                ...n,
                                controls: {
                                    ...n.controls,
                                    [controlKey]: controlValue,
                                },
                            };
                        }),
                    },
                },
            };
            appStore.set(_graphStorageAtom, {
                ...s,
                [parentId]: update,
            });
            await db.chains.put(update);
        }
    });
};

export const deleteGraph = (path: string[]) => {
    QueueUtils.addTask(async () => {
        const s = appStore.get(_graphStorageAtom);
        // main graph
        if (path.length === 1) {
            const targetId = path[0];
            appStore.set(
                _graphStorageAtom,
                Object.fromEntries(
                    Object.entries(s).filter(([id, _]) => id !== targetId)
                )
            );
            await db.chains.delete(targetId);
            clearRedundantOptions();
        }
        // module of graph
        else if (path.length === 2) {
            const [parentId, targetId] = path;

            const parent = s[parentId];

            const update: SerializedGraph = {
                ...parent,
                modules: Object.fromEntries(
                    Object.entries(parent.modules).filter(
                        ([id, _]) => id !== targetId
                    )
                ),
            };
            appStore.set(_graphStorageAtom, {
                ...s,
                [parentId]: update,
            });
            await db.chains.put(update);
        }
    });
};

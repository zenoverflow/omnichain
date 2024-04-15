import { atom } from "jotai";
import { NodeEditor } from "rete";
import { AreaPlugin } from "rete-area-plugin";

import { appStore } from ".";
import { GraphUtils } from "../util/GraphUtils";
import { QueueUtils } from "../util/QueueUtils";
import { db } from "../data/db";
import { SerializedGraph } from "../data/types";
import { NodeContextObj } from "../nodes/context";
import { openGraph } from "./editor";
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

// ACTIONS //

export const createGraph = (name = "New Chain") => {
    QueueUtils.addTask(async () => {
        const s = appStore.get(_graphStorageAtom);
        const created = GraphUtils.empty(name ?? "New Chain");
        appStore.set(_graphStorageAtom, {
            ...s,

            [created.graphId]: created,
        });
        await db.chains.add(created);
        openGraph(created.graphId);
    });
};

export const initGraph = async (context: NodeContextObj) => {
    await GraphUtils.hydrate(
        appStore.get(_graphStorageAtom)[context.graphId],
        context
    );
};

export const updateGraph = (
    editor: NodeEditor<any>,
    area: AreaPlugin<any, any>,
    graphId: string,
    callSource?: string // for debug only
) => {
    QueueUtils.addTask(async () => {
        console.log("UPDATE GRAPH", callSource ?? "somewhere");
        const s = appStore.get(_graphStorageAtom);
        const target = s[graphId];
        const update = GraphUtils.serializeFromEditor(
            editor,
            area,
            // preserve metadata
            target
        );
        appStore.set(_graphStorageAtom, {
            ...s,
            [graphId]: update,
        });
        await db.chains.put(update);
    });
};

export const updateGraphName = (graphId: string, name: string) => {
    QueueUtils.addTask(async () => {
        const s = appStore.get(_graphStorageAtom);
        const target = s[graphId];
        const update = { ...target, name };
        appStore.set(_graphStorageAtom, {
            ...s,
            [graphId]: { ...target, name },
        });
        await db.chains.put(update);
    });
};

export const updateNodeControl = (
    graphId: string,
    nodeId: string,
    controlKey: string,
    controlValue: any
) => {
    QueueUtils.addTask(async () => {
        console.log("UPDATE NODE CONTROL");
        const s = appStore.get(_graphStorageAtom);
        const target = s[graphId];
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
        appStore.set(_graphStorageAtom, {
            ...s,
            [graphId]: update,
        });
        await db.chains.put(update);
    });
};

export const deleteGraph = (graphId: string) => {
    QueueUtils.addTask(async () => {
        const s = appStore.get(_graphStorageAtom);
        appStore.set(
            _graphStorageAtom,
            Object.fromEntries(
                Object.entries(s).filter(([id, _]) => id !== graphId)
            )
        );
        await db.chains.delete(graphId);
        clearRedundantOptions();
    });
};

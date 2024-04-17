import { NodeEditor } from "rete";
import { AreaPlugin } from "rete-area-plugin";

import { StatefulObservable } from "../util/ObservableUtils";
import { GraphUtils } from "../util/GraphUtils";
import { QueueUtils } from "../util/QueueUtils";
import { db } from "../data/db";
import { SerializedGraph } from "../data/types";
import { NodeContextObj } from "../nodes/context";
import { openGraph } from "./editor";
import { clearRedundantOptions } from "./options";

export const graphStorage = new StatefulObservable<
    Record<string, SerializedGraph>
>({});

export const loadGraphsFromDb = async () => {
    graphStorage.set(
        Object.fromEntries(
            (await db.chains.toArray()).map((c) => [c.graphId, c])
        )
    );
};

// ACTIONS //

export const createGraph = (name = "New Chain") => {
    QueueUtils.addTask(async () => {
        const created = GraphUtils.empty(name);
        graphStorage.set({
            ...graphStorage.get(),
            [created.graphId]: created,
        });
        await db.chains.add(created);
        openGraph(created.graphId);
    });
};

export const initGraph = async (context: NodeContextObj) => {
    await GraphUtils.hydrate(graphStorage.get()[context.graphId], context);
};

export const updateGraph = (
    editor: NodeEditor<any>,
    area: AreaPlugin<any, any>,
    graphId: string,
    callSource?: string // for debug only
) => {
    QueueUtils.addTask(async () => {
        console.log("UPDATE GRAPH", callSource ?? "somewhere");
        const storage = graphStorage.get();
        const update = GraphUtils.serializeFromEditor(
            editor,
            area,
            // preserve metadata
            storage[graphId]
        );
        graphStorage.set({
            ...storage,
            [graphId]: update,
        });
        await db.chains.put(update);
    });
};

export const updateGraphName = (graphId: string, name: string) => {
    QueueUtils.addTask(async () => {
        const storage = graphStorage.get();
        const update = { ...storage[graphId], name };
        graphStorage.set({
            ...storage,
            [graphId]: update,
        });
        await db.chains.put(update);
    });
};

export const updateNodeControl = (
    graphId: string,
    nodeId: string,
    controlKey: string,
    controlValue: string | number
) => {
    QueueUtils.addTask(async () => {
        const storage = graphStorage.get();
        const update = {
            ...storage[graphId],
            nodes: storage[graphId].nodes.map((n) => {
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
        graphStorage.set({
            ...storage,
            [graphId]: update,
        });
        await db.chains.put(update);
    });
};

export const deleteGraph = (graphId: string) => {
    QueueUtils.addTask(async () => {
        graphStorage.set(
            Object.fromEntries(
                Object.entries(graphStorage.get()).filter(
                    ([id]) => id !== graphId
                )
            )
        );
        await db.chains.delete(graphId);
        clearRedundantOptions();
    });
};

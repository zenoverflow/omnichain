import type { CAreaPlugin, CNodeEditor } from "../data/typesRete";
import type { SerializedGraph } from "../data/types";

import { StatefulObservable } from "../util/ObservableUtils";
import { GraphUtils } from "../util/GraphUtils";
import { QueueUtils } from "../util/QueueUtils";
import { BackendResourceUtils } from "../util/BackendResourceUtils";
import { closeEditor, openEditor } from "./editor";
import { clearRedundantOptions } from "./options";
import { executorStorage } from "./executor";
import { nodeRegistryStorage } from "./nodeRegistry";
import { complexErrorObservable } from "./watcher";

export const graphStorage = new StatefulObservable<
    Record<string, SerializedGraph>
>({});

export const loadGraphs = async () => {
    graphStorage.set(await BackendResourceUtils.getMultiAll("chains"));
};

const backendSetGraph = async (id: string, data: Record<string, any>) => {
    await BackendResourceUtils.setMultiSingle("chains", id, data);
};

const backendDeleteGraph = async (id: string) => {
    await BackendResourceUtils.deleteMultiSingle("chains", id);
};

// ACTIONS //

export const createGraph = (name = "New Chain") => {
    QueueUtils.addTask(async () => {
        const created = GraphUtils.empty(name);
        await backendSetGraph(created.graphId, created);
        graphStorage.set({
            ...graphStorage.get(),
            [created.graphId]: created,
        });
        openEditor(created.graphId);
    });
};

export const initGraph = async (
    graphId: string,
    editor: CNodeEditor,
    area: CAreaPlugin
) => {
    const graph = graphStorage.get()[graphId];
    try {
        await GraphUtils.hydrate(
            graph,
            editor,
            area,
            nodeRegistryStorage.get()
        );
    } catch (error: any) {
        complexErrorObservable.next(["Hydration error!", error.message]);
    }
};

/**
 * Called from the editor hooks when the graph is updated.
 * Does not affect metadata like name or created.
 * Does not affect control values.
 *
 * @param editor
 * @param area
 * @param graphId
 * @param callSource
 */
export const updateGraph = (
    editor: CNodeEditor,
    area: CAreaPlugin,
    graphId: string,
    _callSource?: string // for debug only
) => {
    QueueUtils.addTask(async () => {
        // console.log("UPDATE GRAPH", callSource ?? "somewhere");
        const graph = graphStorage.get()[graphId];
        const update = GraphUtils.serializeFromEditor(
            editor,
            area,
            // preserve metadata
            graph
        );

        await backendSetGraph(graphId, update);
        graphStorage.set({
            ...graphStorage.get(),
            [graphId]: update,
        });
    });
};

export const updateGraphName = (graphId: string, name: string) => {
    QueueUtils.addTask(async () => {
        const graph = graphStorage.get()[graphId];
        const update = { ...graph, name };

        await backendSetGraph(graphId, update);
        graphStorage.set({
            ...graphStorage.get(),
            [graphId]: update,
        });
    });
};

export const updateNodeControl = async (
    graphId: string,
    nodeId: string,
    controlKey: string,
    controlValue: string | number | null,
    saveToBackend = true
) => {
    const graph = graphStorage.get()[graphId];
    const update = {
        ...graph,
        nodes: graph.nodes.map((n) => {
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
        ...graphStorage.get(),
        [graphId]: update,
    });

    if (saveToBackend) {
        await backendSetGraph(graphId, update);
    }
};

export const deleteGraph = async (graphId: string) => {
    // Cannot delete active graph
    if (executorStorage.get()?.graphId === graphId) {
        return;
    }

    closeEditor();

    await backendDeleteGraph(graphId);
    graphStorage.set(
        Object.fromEntries(
            Object.entries(graphStorage.get()).filter(([id]) => id !== graphId)
        )
    );
    await clearRedundantOptions();
};

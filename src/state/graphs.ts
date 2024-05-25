import { v4 as uuid } from "uuid";

import type { CAreaPlugin, CNodeEditor } from "../data/typesRete";
import type { SerializedGraph } from "../data/types";

import { StatefulObservable } from "../util/ObservableUtils";
import { GraphUtils } from "../util/GraphUtils";
import { QueueUtils } from "../util/QueueUtils";
import { BackendResourceUtils } from "../util/BackendResourceUtils";
import { closeEditor, openEditor, editorTargetStorage } from "./editor";
import { clearRedundantOptions } from "./options";
import { executorStorage } from "./executor";
import { nodeRegistryStorage } from "./nodeRegistry";
import { complexErrorObservable } from "./watcher";
import { GraphValidationUtils } from "../util/GraphValidationUtils";

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

/**
 * Pull up-to-date data about a specific graph from the backend.
 *
 * @param graphId
 */
export const pullSingleGraph = async (graphId: string) => {
    try {
        const graph =
            await BackendResourceUtils.getMultiSingle<SerializedGraph>(
                "chains",
                graphId
            );
        graphStorage.set({
            ...graphStorage.get(),
            [graphId]: graph,
        });

        // Reopen editor if it was open for this graph
        // in order to update the data
        const editorTarget = editorTargetStorage.get();
        if (editorTarget === graphId) {
            closeEditor();
            setTimeout(() => {
                openEditor(graphId);
            }, 1);
        }
    } catch (error: any) {
        console.error(error);
        // complexErrorObservable.next(["Pull error!", error.message]);
    }
};

export const createGraph = async (name = "New Chain") => {
    const created = GraphUtils.empty(name);
    await backendSetGraph(created.graphId, created);
    graphStorage.set({
        ...graphStorage.get(),
        [created.graphId]: created,
    });
    openEditor(created.graphId);
};

export const importGraph = async (graph: SerializedGraph) => {
    try {
        const valid = GraphValidationUtils.validateGraphObj(graph);

        if (!valid) {
            throw new Error("Invalid graph data.");
        }

        const validatedGraph: SerializedGraph = {
            ...graph,
            graphId: uuid(),
            created: Date.now(),
        };

        await backendSetGraph(validatedGraph.graphId, validatedGraph);

        graphStorage.set({
            ...graphStorage.get(),
            [validatedGraph.graphId]: validatedGraph,
        });

        openEditor(validatedGraph.graphId);
    } catch (error: any) {
        console.error(error);
        complexErrorObservable.next(["Import error!", error.message]);
    }
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

export const updateGraphExecPersistence = (
    graphId: string,
    execPersistence: SerializedGraph["execPersistence"]
) => {
    QueueUtils.addTask(async () => {
        const graph = graphStorage.get()[graphId];
        const update: SerializedGraph = { ...graph, execPersistence };

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

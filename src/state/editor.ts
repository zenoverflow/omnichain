import type { CustomNode } from "../data/typesCustomNodes";
import type { CNodeEditor, CAreaPlugin } from "../data/typesRete";

import { GraphUtils } from "../util/GraphUtils";
import { StatefulObservable } from "../util/ObservableUtils";

import { nodeSelectionStorage, updateNodeSelection } from "./nodeSelection";
import { nodeRegistryStorage } from "./nodeRegistry";
import { graphStorage } from "./graphs";
import { complexErrorObservable } from "./watcher";
import { SerializedGraph } from "../data/types";

export const editorTargetStorage = new StatefulObservable<string | null>(null);

export const editorStateStorage = new StatefulObservable<{
    editor: CNodeEditor;
    area: CAreaPlugin;
    unselect: (id: string) => any;
} | null>(null);

// ACTIONS //

export const setEditorState = (
    editor: CNodeEditor,
    area: CAreaPlugin,
    unselect: (id: string) => any
) => {
    editorStateStorage.set({ editor, area, unselect });
};

export const clearEditorState = () => {
    editorStateStorage.set(null);
};

export const openEditor = (graphId: string) => {
    const targetGraph = graphStorage.get()[graphId];

    // Missing nodes check
    const missingNodes = targetGraph.nodes.filter(
        (n) =>
            !(nodeRegistryStorage.get()[n.nodeType] as CustomNode | undefined)
    );
    if (missingNodes.length > 0) {
        complexErrorObservable.next([
            "Hydration error!",
            `Cannot load graph! Missing nodes: ${missingNodes
                .map((n) => n.nodeType)
                .join(", ")}`,
        ]);
    }
    // Open graph
    else {
        editorTargetStorage.set(graphId);
    }
};

export const closeEditor = () => {
    editorTargetStorage.set(null);
};

/**
 * Duplicate a specific node
 */
export const duplicateNode = async (id: string) => {
    const editorState = editorStateStorage.get();
    if (!editorState) return;

    const editorTarget = editorTargetStorage.get();
    if (!editorTarget) return;

    const { editor, area } = editorState;

    const graph = graphStorage.get()[editorTarget] as
        | SerializedGraph
        | undefined;
    if (!graph) return;

    const originalData = graph.nodes.find((n) => n.nodeId === id);
    if (!originalData) return;

    // Special nodes cannot be duplicated
    if (!["StartNode"].includes(originalData.nodeType)) {
        const nodeView = area.nodeViews.get(id);
        if (!nodeView) return;

        const duplicate = GraphUtils.mkEditorNode(
            editorTarget,
            originalData.nodeType,
            nodeRegistryStorage.get(),
            undefined,
            originalData.controls
        );

        await editor.addNode(duplicate);

        // Move node near original
        const duplicateView = area.nodeViews.get(duplicate.id);
        if (duplicateView) {
            await duplicateView.translate(
                nodeView.position.x + 50,
                nodeView.position.y + 50
            );
        }
    }
};

/**
 * Delete a single node.
 * Unselects any selected nodes.
 */
export const deleteNode = async (id: string) => {
    const editorState = editorStateStorage.get();
    if (!editorState) return;

    const { editor, unselect } = editorState;

    const selectedNodes = nodeSelectionStorage.get();

    // Ensure all nodes unselected
    for (const id of selectedNodes) {
        unselect(id);
    }
    updateNodeSelection([]);

    const targetNode = editor.getNode(id);

    // Special nodes cannot be deleted
    if (!["StartNode"].includes(targetNode.label)) {
        // Delete related connections
        for (const conn of editor.getConnections()) {
            if (
                !conn.source ||
                !conn.target ||
                conn.source === id ||
                conn.target === id
            ) {
                await editor.removeConnection(conn.id);
            }
        }

        await editor.removeNode(id);
    }
};

/**
 * Delete all selected nodes.
 */
export const deleteSelectedNodes = async () => {
    const selectedNodes = nodeSelectionStorage.get();
    for (const id of selectedNodes) {
        await deleteNode(id);
    }
};

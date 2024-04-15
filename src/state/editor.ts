import { atom } from "jotai";

import { appStore } from ".";
import { deleteGraph, graphStorageAtom, updateGraphName } from "./graphs";
import { runGraph, stopGraph } from "./executor";
import { nodeSelectionAtom, updateNodeSelection } from "./nodeSelection";
import * as NODE_MAKERS from "../nodes";
import { NodeContextObj } from "../nodes/context";

type EditorState = {
    graphId: string | null;
};

const _editorStateAtom = atom<EditorState>({
    graphId: null,
});

export const editorStateAtom = atom((get) => ({ ...get(_editorStateAtom) }));

export const currentGraphAtom = atom((get) => {
    const s = () => get(graphStorageAtom);
    const { graphId } = get(_editorStateAtom);
    if (graphId) return s()[graphId];
    return null;
});

export const openGraph = (graphId: string) => {
    appStore.set(_editorStateAtom, {
        ...appStore.get(_editorStateAtom),
        graphId,
    });
};

export const closeEditor = () => {
    appStore.set(_editorStateAtom, {
        ...appStore.get(_editorStateAtom),
        graphId: null,
    });
};

export const runCurrentGraph = async () => {
    const { graphId } = appStore.get(_editorStateAtom);
    if (graphId) await runGraph(graphId);
};

export const stopCurrentGraph = () => {
    const { graphId } = appStore.get(_editorStateAtom);
    if (graphId) stopGraph(graphId);
};

export const deleteCurrentGraph = () => {
    const { graphId } = appStore.get(_editorStateAtom);
    if (graphId) {
        closeEditor();
        deleteGraph(graphId);
    }
};

export const updateCurrentGraphName = (name: string) => {
    const { graphId } = appStore.get(_editorStateAtom);
    if (graphId) updateGraphName(graphId, name);
};

/**
 * Duplicate a specific node
 */
export const duplicateNode = async (
    id: string,
    nodeContext: NodeContextObj
) => {
    const { editor, area } = nodeContext;
    if (!area) return;

    const original = editor.getNode(id);
    if (!original) return;

    // Special nodes cannot be duplicated
    if (!["StartNode"].includes(original.label)) {
        const nodeView = area.nodeViews.get(id);
        if (!nodeView) return;

        const Maker = (NODE_MAKERS as any)[original.label];
        if (!Maker) return;

        const duplicate = new Maker(nodeContext);
        // Copy control values
        for (const [key, control] of Object.entries<any>(original.controls)) {
            duplicate.controls[key].value = control.value;
        }

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
export const deleteNode = async (id: string, nodeContext: NodeContextObj) => {
    const { editor, unselect } = nodeContext;

    const selectedNodes = appStore.get(nodeSelectionAtom);

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
export const deleteSelectedNodes = async (nodeContext: NodeContextObj) => {
    const selectedNodes = appStore.get(nodeSelectionAtom);
    for (const id of selectedNodes) {
        await deleteNode(id, nodeContext);
    }
};

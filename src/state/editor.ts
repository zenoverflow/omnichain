import { atom } from "jotai";

import { appStore } from ".";

import {
    createGraph,
    deleteGraph,
    graphStorageAtom,
    updateGraphName,
} from "./graphs";
import { runGraph, stopGraph } from "./executor";
import { nodeSelectionAtom, updateNodeSelection } from "./nodeSelection";
import { signalEditorUpdate } from "./watcher";
import * as NODE_MAKERS from "../nodes";
import { NodeContextObj } from "../nodes/context";
import { StartNode, ModuleInputNode, ModuleOutputNode } from "../nodes";

type EditorState = {
    path: string[];
};

const _editorStateAtom = atom<EditorState>({
    path: [],
});

export const editorStateAtom = atom((get) => ({ ...get(_editorStateAtom) }));

export const currentGraphAtom = atom((get) => {
    const gStore = () => get(graphStorageAtom);
    const gPath = get(_editorStateAtom).path;
    //
    if (gPath.length === 1) {
        return gStore()[gPath[0]];
    }
    //
    else if (gPath.length === 2) {
        return gStore()[gPath[0]].modules[gPath[1]];
    }
    return null;
});

export const openPath = (path: string[]) => {
    if (!path.length || path.length > 2) return;
    appStore.set(_editorStateAtom, {
        ...appStore.get(_editorStateAtom),
        path,
    });
};

export const closeEditor = () => {
    appStore.set(_editorStateAtom, {
        ...appStore.get(_editorStateAtom),
        path: [],
    });
};

export const runCurrentGraph = async () => {
    const { path } = appStore.get(_editorStateAtom);

    if (path.length) {
        await runGraph(path[0]);
    }
};

export const stopCurrentGraph = () => {
    const { path } = appStore.get(_editorStateAtom);

    if (path.length) {
        stopGraph(path[0]);
    }
};

export const createModule = async (name?: string) => {
    const { path } = appStore.get(_editorStateAtom);

    if (path.length) {
        await createGraph(name ?? "New Module", path[0]);
    }
};

export const deleteCurrentGraph = async () => {
    const { path } = appStore.get(_editorStateAtom);

    if (path.length) {
        closeEditor();
        await deleteGraph(path);
    }
};

export const updateCurrentGraphName = async (name: string) => {
    const { path } = appStore.get(_editorStateAtom);

    if (path.length) {
        await updateGraphName(path, name);
    }
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
    if (
        ![StartNode.name, ModuleOutputNode.name, ModuleInputNode.name].includes(
            original.label
        )
    ) {
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

    signalEditorUpdate();
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
    if (![ModuleOutputNode.name, StartNode.name].includes(targetNode.label)) {
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

    signalEditorUpdate();
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

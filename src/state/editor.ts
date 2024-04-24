import { StatefulObservable } from "../util/ObservableUtils";
import { nodeSelectionStorage, updateNodeSelection } from "./nodeSelection";
import { NodeContextObj } from "../nodes/context";
import { nodeRegistryStorage } from "./nodeRegistry";
import { graphStorage } from "./graphs";
import { complexErrorObservable } from "./watcher";

export const editorTargetStorage = new StatefulObservable<string | null>(null);

// ACTIONS //

export const openEditor = (graphId: string) => {
    const targetGraph = graphStorage.get()[graphId];

    // Missing nodes check
    const missingNodes = targetGraph.nodes.filter(
        (n) => !nodeRegistryStorage.get()[n.nodeType]
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

        const Maker = nodeRegistryStorage.get()[original.label];
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
export const deleteSelectedNodes = async (nodeContext: NodeContextObj) => {
    const selectedNodes = nodeSelectionStorage.get();
    for (const id of selectedNodes) {
        await deleteNode(id, nodeContext);
    }
};

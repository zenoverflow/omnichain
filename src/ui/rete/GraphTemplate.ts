import { EntrypointNode, ModuleInputNode, ModuleOutputNode } from "../../nodes";

import { NodeContextObj } from "../../nodes/context";

export class GraphTemplate {
    public static async empty(nodeContext: NodeContextObj) {
        // Default content for new graphs

        const { editor, pathToGraph, area } = nodeContext;

        // Main graph
        if (pathToGraph.length === 1) {
            await editor.addNode(new EntrypointNode(nodeContext));
        }
        // Module of graph
        else if (pathToGraph.length === 2) {
            const modInputNode = new ModuleInputNode(nodeContext);
            const modOutputNode = new ModuleOutputNode(nodeContext);
            await editor.addNode(modInputNode);
            await editor.addNode(modOutputNode);

            if (area) {
                const inputView = area.nodeViews.get(modInputNode.id);
                const outputView = area.nodeViews.get(modOutputNode.id);

                const t1 = {
                    x: (inputView?.position?.x ?? 0) - 120,
                    y: outputView?.position?.y ?? 0,
                };
                const t2 = {
                    x: (inputView?.position?.x ?? 0) + 120,
                    y: outputView?.position?.y ?? 0,
                };

                area.translate(modInputNode.id, t1);
                area.translate(modOutputNode.id, t2);
            }
        }
    }
}

import { StartNode } from "../../nodes";
import { NodeContextObj } from "../../nodes/context";

export const GraphTemplate = {
    async empty(context: NodeContextObj) {
        await context.editor.addNode(StartNode.editorNode(context));
    },
};

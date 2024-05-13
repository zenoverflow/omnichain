import type { NodeEditor } from "rete";

import { StartNode } from "../../nodes";
import { NodeContextObj } from "../../nodes/context";

export const GraphTemplate = {
    async empty(editor: NodeEditor<any>, context: NodeContextObj) {
        await editor.addNode(StartNode.editorNode(context));
    },
};

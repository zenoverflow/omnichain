import type { NodeEditor } from "rete";

import type { NodeContextObj } from "../../nodes/context";
import type { CustomNode } from "../../data/typesCustomNodes";

import { GraphUtils } from "../../util/GraphUtils";

export const GraphTemplate = {
    async empty(
        editor: NodeEditor<any>,
        context: NodeContextObj,
        nodeRegistry: Record<string, CustomNode>
    ) {
        await editor.addNode(
            GraphUtils.mkEditorNode("StartNode", context, nodeRegistry)
        );
    },
};

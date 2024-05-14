import type { NodeEditor } from "rete";

import type { CustomNode } from "../../data/typesCustomNodes";

import { GraphUtils } from "../../util/GraphUtils";

export const GraphTemplate = {
    async empty(
        editor: NodeEditor<any>,
        graphId: string,
        nodeRegistry: Record<string, CustomNode>
    ) {
        await editor.addNode(
            GraphUtils.mkEditorNode(graphId, "StartNode", nodeRegistry)
        );
    },
};

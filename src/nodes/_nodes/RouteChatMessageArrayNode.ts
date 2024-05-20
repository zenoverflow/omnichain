import { makeNode } from "./_Base";

const doc = [
    //
    "Use to route chat message array connections.",
]
    .join(" ")
    .trim();

export const RouteChatMessageArrayNode = makeNode(
    {
        nodeName: "RouteChatMessageArrayNode",
        nodeIcon: "BranchesOutlined",
        dimensions: [330, 130],
        doc,
    },
    {
        inputs: [
            //
            { name: "in", type: "chatMessageArray", label: "in" },
        ],
        outputs: [
            //
            { name: "out", type: "chatMessageArray", label: "out" },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            return {
                out: (inputs.in || [])[0] || [],
            };
        },
    }
);

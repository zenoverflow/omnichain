import { makeNode } from "./_Base";

const doc = [
    //
    "Use to route file array connections.",
]
    .join(" ")
    .trim();

export const RouteFileArrayNode = makeNode(
    {
        nodeName: "RouteFileArrayNode",
        nodeIcon: "BranchesOutlined",
        dimensions: [300, 180],
        doc,
    },
    {
        inputs: [
            //
            { name: "in", type: "fileArray", label: "in" },
        ],
        outputs: [
            //
            { name: "out", type: "fileArray", label: "out" },
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

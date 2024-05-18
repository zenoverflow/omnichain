import { makeNode } from "./_Base";

const doc = [
    //
    "Use to route string array connections.",
]
    .join(" ")
    .trim();

export const RouteStringArrayNode = makeNode(
    {
        nodeName: "RouteStringArrayNode",
        nodeIcon: "BranchesOutlined",
        dimensions: [300, 180],
        doc,
    },
    {
        inputs: [
            //
            { name: "in", type: "stringArray", label: "in" },
        ],
        outputs: [
            //
            { name: "out", type: "stringArray", label: "out" },
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

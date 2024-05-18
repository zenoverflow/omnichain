import { makeNode } from "./_Base";

const doc = [
    //
    "Use to route string connections.",
]
    .join(" ")
    .trim();

export const RouteStringNode = makeNode(
    {
        nodeName: "RouteStringNode",
        nodeIcon: "BranchesOutlined",
        dimensions: [300, 180],
        doc,
    },
    {
        inputs: [
            //
            { name: "in", type: "string", label: "in" },
        ],
        outputs: [
            //
            { name: "out", type: "string", label: "out" },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            return {
                out: (inputs.in || [])[0] || "",
            };
        },
    }
);

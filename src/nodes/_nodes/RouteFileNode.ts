import { makeNode } from "./_Base";

const doc = [
    //
    "Use to route file connections.",
]
    .join(" ")
    .trim();

export const RouteFileNode = makeNode(
    {
        nodeName: "RouteFileNode",
        nodeIcon: "BranchesOutlined",
        dimensions: [300, 180],
        doc,
    },
    {
        inputs: [
            //
            { name: "in", type: "file", label: "in" },
        ],
        outputs: [
            //
            { name: "out", type: "file", label: "out" },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const file = (inputs.in || [])[0];

            if (!file) {
                throw new Error("No file input.");
            }

            return {
                out: file,
            };
        },
    }
);

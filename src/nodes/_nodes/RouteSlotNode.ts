import { makeNode } from "./_Base";

const doc = [
    //
    "Use to route slot connections.",
]
    .join(" ")
    .trim();

export const RouteSlotNode = makeNode(
    {
        nodeName: "RouteSlotNode",
        nodeIcon: "BranchesOutlined",
        dimensions: [330, 130],
        doc,
    },
    {
        inputs: [
            //
            { name: "in", type: "slot", label: "in" },
        ],
        outputs: [
            //
            { name: "out", type: "slot", label: "out" },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const slotObj = (inputs.in || [])[0];

            if (!slotObj) {
                throw new Error("No slot input.");
            }

            return {
                out: slotObj,
            };
        },
    }
);

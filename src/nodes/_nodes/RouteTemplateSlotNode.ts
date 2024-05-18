import { makeNode } from "./_Base";

const doc = [
    //
    "Use to route template slot connections.",
]
    .join(" ")
    .trim();

export const RouteTemplateSlotNode = makeNode(
    {
        nodeName: "RouteTemplateSlotNode",
        nodeIcon: "BranchesOutlined",
        dimensions: [300, 180],
        doc,
    },
    {
        inputs: [
            //
            { name: "in", type: "templateSlot", label: "in" },
        ],
        outputs: [
            //
            { name: "out", type: "templateSlot", label: "out" },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const slotObj = (inputs.in || [])[0];

            if (!slotObj) {
                throw new Error("No template slot input.");
            }

            return {
                out: slotObj,
            };
        },
    }
);

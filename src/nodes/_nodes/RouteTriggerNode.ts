import { makeNode } from "./_Base";

const doc = [
    //
    "Use to route trigger connections.",
]
    .join(" ")
    .trim();

export const RouteTriggerNode = makeNode(
    {
        nodeName: "RouteTriggerNode",
        nodeIcon: "BranchesOutlined",
        dimensions: [330, 180],
        doc,
    },
    {
        inputs: [
            //
            { name: "in", type: "trigger", label: "in" },
        ],
        outputs: [
            //
            { name: "out", type: "trigger", label: "out" },
        ],
        controls: [],
    },
    {
        async controlFlow(_nodeId, _context) {
            return "out";
        },
    }
);

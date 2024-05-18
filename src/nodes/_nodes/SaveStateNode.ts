import { makeNode } from "./_Base";

const doc = [
    "Saves the chain's current state to disk.",
    "Used in conjunction with the 'On demand' chain saving",
    "mode from the options menu. Allows saving the chain only",
    "when this node is triggered, which removes any performance",
    "bottlenecks caused by disk write speed.",
]
    .join(" ")
    .trim();

export const SaveStateNode = makeNode(
    {
        nodeName: "SaveStateNode",
        nodeIcon: "CodeOutlined",
        dimensions: [300, 180],
        doc,
    },
    {
        inputs: [
            //
            { name: "triggerIn", type: "trigger", label: "trigger in" },
        ],
        outputs: [
            //
            { name: "triggerOut", type: "trigger", label: "trigger out" },
        ],
        controls: [],
    },
    {
        async controlFlow(_nodeId, context) {
            try {
                await context.onExternalAction({
                    type: "saveGraph",
                });

                return "triggerOut";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);

import { makeNode } from "./_Base";

const doc = [
    //
    "Leave only the last 'n' messages in the session.",
]
    .join(" ")
    .trim();

export const SessionReduceNode = makeNode(
    {
        nodeName: "SessionReduceNode",
        nodeIcon: "FireOutlined",
        dimensions: [350, 220],
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
        controls: [
            {
                name: "n",
                control: {
                    type: "number",
                    defaultValue: 1,
                    config: {
                        label: "n",
                        min: 1,
                    },
                },
            },
        ],
    },
    {
        async controlFlow(nodeId, context) {
            try {
                await context.extraAction({
                    type: "reduceSession",
                    args: {
                        n: context.getAllControls(nodeId).n as number,
                    },
                });

                return "triggerOut";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);

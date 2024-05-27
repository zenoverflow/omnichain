import { makeNode } from "./_Base";

const doc = [
    //
    "Clears all messages from the current chain execution's chat session.",
]
    .join(" ")
    .trim();

export const SessionClearNode = makeNode(
    {
        nodeName: "SessionClearNode",
        nodeIcon: "FireOutlined",
        dimensions: [350, 170],
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
                await context.extraAction({
                    type: "clearSession",
                });

                return "triggerOut";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);

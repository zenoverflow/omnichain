import { makeNode } from "./_Base";

const doc = [
    "Takes a response message with the assistant role",
    "and adds it to the current session.",
]
    .join(" ")
    .trim();

export const ResponseNode = makeNode(
    {
        nodeName: "ResponseNode",
        nodeIcon: "CommentOutlined",
        dimensions: [350, 200],
        doc,
    },
    {
        inputs: [
            { name: "triggerIn", type: "trigger", label: "trigger in" },
            { name: "message", type: "chatMessage", label: "message" },
        ],
        outputs: [
            { name: "triggerOut", type: "trigger", label: "trigger out" },
        ],
        controls: [],
    },
    {
        async controlFlow(nodeId, context) {
            try {
                const inputs = await context.fetchInputs(nodeId);

                const message = (inputs["message"] || [])[0];
                if (!message) {
                    throw new Error("ResponseNode: Missing message input");
                }
                await context.extraAction({
                    type: "addMessageToSession",
                    args: { message },
                });

                return "triggerOut";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);

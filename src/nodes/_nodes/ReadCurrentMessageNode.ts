import { makeNode } from "./_Base";

const doc = [
    "Reads the current message content from the session.",
    "The message must first be saved to the session using",
    "the AwaitNextMessage node. Consecutive use of this node",
    "will return text from the same message until a new one is saved.",
]
    .join(" ")
    .trim();

export const ReadCurrentMessageNode = makeNode(
    {
        nodeName: "ReadCurrentMessageNode",
        nodeIcon: "CommentOutlined",
        dimensions: [300, 100],
        doc,
    },
    {
        inputs: [],
        outputs: [{ name: "message", type: "chatMessage", label: "message" }],
        controls: [],
    },
    {
        async dataFlow(_nodeId, context) {
            const message = await context.onExternalAction({
                type: "readCurrentMessage",
            });
            if (!message) {
                throw new Error("ReadCurrentMessageNode: No message available");
            }
            return { message };
        },
    }
);

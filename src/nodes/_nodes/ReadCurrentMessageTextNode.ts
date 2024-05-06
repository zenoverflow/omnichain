import { makeNode } from "./_Base";
import type { ChatMessage } from "../../data/types";

const doc = [
    "Reads the current message's text content from the session.",
    "The message must first be saved to the session using",
    "the AwaitNextMessage node. Consecutive use of this node",
    "will return text from the same message until a new one is saved.",
]
    .join(" ")
    .trim();

export const ReadCurrentMessageTextNode = makeNode(
    {
        nodeName: "ReadCurrentMessageTextNode",
        nodeIcon: "CommentOutlined",
        dimensions: [300, 100],
        doc,
    },
    {
        inputs: [],
        outputs: [{ name: "content", type: "string", label: "text" }],
        controls: [],
    },
    {
        dataFlow: {
            inputs: [],
            outputs: ["content"],
            async logic(_node, context, _controls, _fetchInputs) {
                const msg: ChatMessage | null = await context.onExternalAction({
                    type: "readCurrentMessage",
                });
                return {
                    content: msg?.content || "",
                };
            },
        },
    }
);

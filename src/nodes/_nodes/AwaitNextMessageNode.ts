import { makeNode } from "./_Base";

import type { ChatMessage } from "../../data/types";

const doc = [
    "Waits for a new user message to appear on the message queue.",
    "When a new message is detected, this node will save it to the session.",
    "It can then be read using the ReadCurrentMessage node as many times",
    "as needed. Each execution of this node will wait for a new message",
    "and replace the previous one in the session.",
]
    .join(" ")
    .trim();

export const AwaitNextMessageNode = makeNode(
    {
        nodeName: "AwaitNextMessageNode",
        nodeIcon: "CommentOutlined",
        dimensions: [300, 175],
        doc,
    },
    {
        inputs: [{ name: "triggerIn", type: "trigger", label: "trigger in" }],
        outputs: [
            { name: "triggerOut", type: "trigger", label: "trigger out" },
        ],
        controls: [],
    },
    {
        controlFlow: {
            inputs: ["triggerIn"],
            outputs: ["triggerOut"],
            async logic(_node, context, _controls, _fetchInputs, forward) {
                const check = async () => {
                    const messages = (await context.onExternalAction({
                        type: "checkQueue",
                    })) as ChatMessage[];
                    if (messages.length) {
                        const last = messages[messages.length - 1];
                        if (last.role === "user") {
                            return true;
                        }
                    }
                    return false;
                };
                while (!(await check())) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
                await context.onExternalAction({
                    type: "grabNextMessage",
                });
                forward("triggerOut");
            },
        },
    }
);

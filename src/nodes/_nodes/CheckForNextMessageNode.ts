import { makeNode } from "./_Base";

import type { ChatMessage } from "../../data/types";

const doc = [
    "Checks if a new user message has appeared on the message queue.",
    "If a new message is detected, this node saves it to the session,",
    "so it can be read by other nodes, and triggers the 'yes' output.",
    "If no message is detected, it triggers the 'no' output.",
    "Every time a new message is detected, it replaces the previous one",
    "in the session.",
]
    .join(" ")
    .trim();

export const CheckForNextMessageNode = makeNode(
    {
        nodeName: "CheckForNextMessageNode",
        nodeIcon: "CommentOutlined",
        dimensions: [300, 220],
        doc,
    },
    {
        inputs: [
            {
                name: "triggerIn",
                type: "trigger",
                label: "trigger in",
                multi: true,
            },
        ],
        outputs: [
            { name: "haveMsg", type: "trigger", label: "yes" },
            { name: "noMsg", type: "trigger", label: "no" },
        ],
        controls: [
            {
                name: "waitTimeMs",
                control: {
                    type: "number",
                    defaultValue: 100,
                    config: {
                        label: "Polling interval (ms)",
                        min: 1,
                    },
                },
            },
        ],
    },
    {
        async controlFlow(nodeId, context) {
            const waitTime = context.getAllControls(nodeId)
                .waitTimeMs as number;

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

            if (await check()) {
                await context.onExternalAction({
                    type: "grabNextMessage",
                });
                return "haveMsg";
            }

            await new Promise((resolve) => setTimeout(resolve, waitTime));

            if (!context.getFlowActive()) return null;

            return "noMsg";
        },
    }
);

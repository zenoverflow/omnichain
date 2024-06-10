import { makeNode } from "./_Base";

import type { ChatMessage } from "../../data/types";

const doc = [
    "Checks if a new user message has appeared on the message queue.",
    "If a new message is detected, this node saves it as the current message,",
    "so it can be read by other nodes, and triggers the 'yes' output.",
    "If no message is detected, it triggers the 'no' output.",
    "Every time a new message is detected, it replaces the previous one",
    "as the one considered the current message.",
]
    .join(" ")
    .trim();

export const CheckForNextMessageNode = makeNode(
    {
        nodeName: "CheckForNextMessageNode",
        nodeIcon: "CommentOutlined",
        dimensions: [330, 250],
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
            try {
                const controls = context.getAllControls(nodeId);

                const checkForFreshMsg =
                    async (): Promise<ChatMessage | null> => {
                        const messages: ChatMessage[] =
                            await context.extraAction({
                                type: "checkQueue",
                            });

                        if (messages.length) {
                            const prevMessage: ChatMessage | null =
                                await context.extraAction({
                                    type: "readCurrentMessage",
                                });

                            const latest = messages[messages.length - 1];

                            if (
                                latest.role === "user" &&
                                latest.messageId !== prevMessage?.messageId
                            ) {
                                return latest;
                            }
                        }

                        return null;
                    };

                const freshMsg = await checkForFreshMsg();

                if (freshMsg) {
                    // Saves the last message to the session
                    await context.extraAction({
                        type: "grabNextMessage",
                    });
                    return "haveMsg";
                }

                await new Promise((resolve) =>
                    setTimeout(resolve, controls.waitTimeMs as number)
                );

                if (!context.getFlowActive()) return null;

                return "noMsg";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);

import type { ChatMessage } from "../../data/types";

import { makeNode } from "./_Base";

const doc = [
    "Turns an array of chat messages into a context string",
    "for use in string templates. You can also specify the",
    "separator to use between messages and a message prefix",
    "to add before each message according to the role (user or assistant).",
]
    .join(" ")
    .trim();

export const ChatMessageArrayToContextManualNode = makeNode(
    {
        nodeName: "ChatMessageArrayToContextManualNode",
        nodeIcon: "CommentOutlined",
        dimensions: [400, 330],
        doc,
    },
    {
        inputs: [
            {
                name: "messages",
                type: "chatMessageArray",
                label: "messages (array)",
            },
        ],
        outputs: [
            {
                name: "result",
                type: "string",
                label: "result (string)",
            },
        ],

        controlsOverride: {
            user_prefix: "userPrefix",
            assistant_prefix: "assistantPrefix",
            separator: "separator",
        },
        controls: [
            {
                name: "userPrefix",
                control: {
                    type: "text",
                    defaultValue: "user: ",
                    config: {
                        label: "user_prefix",
                    },
                },
            },
            {
                name: "assistantPrefix",
                control: {
                    type: "text",
                    defaultValue: "assistant: ",
                    config: {
                        label: "assistant_prefix",
                    },
                },
            },
            {
                name: "separator",
                control: {
                    type: "text",
                    defaultValue: "\\n",
                    config: {
                        label: "separator",
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getControlsWithOverride(nodeId, inputs);

            let separator = (controls.separator as string) || "";

            // Characters in the separator are escaped
            // So convert things like \n to actual newlines
            separator = separator.replace(/\\n/g, "\n").replace(/\\t/g, "\t");

            const messages: ChatMessage[] = (inputs.messages || [])[0] || [];

            const userPrefix = controls.userPrefix as string;
            const assistantPrefix = controls.assistantPrefix as string;

            const result = messages
                .map((msg) => {
                    if (msg.role === "user" && userPrefix.length) {
                        return `${controls.userPrefix}${msg.content}`;
                    }

                    if (msg.role === "assistant" && assistantPrefix.length) {
                        return `${controls.assistantPrefix}${msg.content}`;
                    }

                    return msg.content;
                })
                .join(separator);

            return { result };
        },
    }
);

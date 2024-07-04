import type { ChatMessage } from "../../data/types";

import { makeNode } from "./_Base";

const doc = [
    "Turns an array of chat messages into a context string",
    "for use in string templates. You can toggle whether to",
    "include the avatar name, and you can also specify the",
    "separator to use between messages.",
]
    .join(" ")
    .trim();

export const ChatMessageArrayToContextNode = makeNode(
    {
        nodeName: "ChatMessageArrayToContextNode",
        nodeIcon: "CommentOutlined",
        dimensions: [350, 220],
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
        controls: [
            {
                name: "addAvatarName",
                control: {
                    type: "select",
                    defaultValue: "true",
                    config: {
                        label: "add avatar name",
                        values: [
                            { label: "true", value: "true" },
                            { label: "false", value: "false" },
                        ],
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
            const controls = context.getAllControls(nodeId);

            let separator = (controls.separator as string) || "";

            // Characters in the separator are escaped
            // So convert things like \n to actual newlines
            separator = separator.replace(/\\n/g, "\n").replace(/\\t/g, "\t");

            const messages: ChatMessage[] = (inputs.messages || [])[0] || [];

            const result = messages
                .map((msg) =>
                    controls.addAvatarName === "true" && msg.from
                        ? `${msg.from}: ${msg.content}`
                        : msg.content
                )
                .join(separator);

            return { result };
        },
    }
);

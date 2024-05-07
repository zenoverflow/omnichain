import { makeNode } from "./_Base";
import { ChatMessage } from "../../data/types";

const doc = [
    //
    "Reads all messages from the current session.",
    "The limit can be set to a specific number of messages or -1",
    "to read all messages. The messages are output as an array.",
]
    .join(" ")
    .trim();

export const ReadSessionMessagesNode = makeNode(
    {
        nodeName: "ReadSessionMessagesNode",
        nodeIcon: "CommentOutlined",
        dimensions: [300, 150],
        doc,
    },
    {
        inputs: [],
        outputs: [
            { name: "messages", type: "chatMessageArray", label: "messages" },
        ],
        controls: [
            {
                name: "limit",
                control: {
                    type: "number",
                    defaultValue: -1,
                    config: {
                        label: "limit",
                        min: -1,
                    },
                },
            },
        ],
    },
    {
        dataFlow: {
            inputs: [],
            outputs: ["messages"],
            async logic(_node, context, controls, _fetchInputs) {
                const messages: ChatMessage[] = await context.onExternalAction({
                    type: "readSessionMessages",
                });
                const limit = controls.limit as number;
                return {
                    messages: limit === -1 ? messages : messages.slice(-limit),
                };
            },
        },
    }
);

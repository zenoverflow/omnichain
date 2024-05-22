import { ChatMessage } from "../../data/types";
import { makeNode } from "./_Base";

const doc = [
    //
    "Limit an array of chat messages via maximum character length.",
    "The node will remove chat messages from the start of the array",
    "until the total text length of all messages is less than or",
    "equal to the specified maximum length.",
]
    .join(" ")
    .trim();

export const LimitChatMessageArrayNode = makeNode(
    {
        nodeName: "LimitChatMessageArrayNode",
        nodeIcon: "CalculatorOutlined",
        dimensions: [330, 180],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "messagesIn",
                type: "chatMessageArray",
                label: "messages",
            },
        ],
        outputs: [
            //
            {
                name: "messagesOut",
                type: "chatMessageArray",
                label: "messages",
            },
        ],
        controls: [
            {
                name: "maxLength",
                control: {
                    type: "number",
                    defaultValue: 100,
                    config: {
                        label: "max chars",
                        min: 1,
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getAllControls(nodeId);

            const messages: ChatMessage[] = (inputs.messagesIn || [])[0] || [];
            const maxLength = controls.maxLength as number;

            const messagesOut: ChatMessage[] = [];
            let total = 0;

            // Reverse the array to loop from newest to oldest
            for (const message of [...messages].reverse()) {
                if (total + message.content.length > maxLength) {
                    break;
                }

                // Add to the front of the array so that
                // the order in the result goes from oldest to newest
                messagesOut.unshift(message);

                total += message.content.length;
            }

            return { messagesOut };
        },
    }
);

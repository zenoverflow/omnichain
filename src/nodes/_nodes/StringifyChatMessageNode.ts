import { makeNode } from "./_Base";

const doc = [
    //
    "Convert a chat message to a JSON string.",
]
    .join(" ")
    .trim();

export const StringifyChatMessageNode = makeNode(
    {
        nodeName: "StringifyChatMessageNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [330, 130],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "in",
                type: "chatMessage",
                label: "message",
            },
        ],
        outputs: [
            //
            {
                name: "out",
                type: "string",
                label: "string (json)",
            },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);

            const result = (inputs.in || [])[0];

            if (!result) {
                throw new Error("No chat message provided.");
            }

            return {
                out: JSON.stringify(result),
            };
        },
    }
);

import { makeNode } from "./_Base";

const doc = [
    //
    "Makes the input text all lowercase.",
]
    .join(" ")
    .trim();

export const MakeTextLowercaseNode = makeNode(
    {
        nodeName: "MakeTextLowercaseNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [350, 130],
        doc,
    },
    {
        inputs: [
            {
                name: "text",
                type: "string",
                label: "text",
            },
        ],
        outputs: [
            {
                name: "result",
                type: "string",
                label: "text (lowercase)",
            },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);

            const text: string = (inputs.text || [])[0] || "";

            return { result: text.toLowerCase() };
        },
    }
);

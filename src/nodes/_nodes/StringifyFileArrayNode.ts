import { makeNode } from "./_Base";

const doc = [
    //
    "Convert an array of files to a JSON string.",
]
    .join(" ")
    .trim();

export const StringifyFileArrayNode = makeNode(
    {
        nodeName: "StringifyFileArrayNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [330, 130],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "in",
                type: "fileArray",
                label: "files (array)",
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

            const result = (inputs.in || [])[0] || [];

            return {
                out: JSON.stringify(result, null, 2),
            };
        },
    }
);

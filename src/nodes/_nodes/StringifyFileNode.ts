import { makeNode } from "./_Base";

const doc = [
    //
    "Convert a file to a JSON string.",
]
    .join(" ")
    .trim();

export const StringifyFileNode = makeNode(
    {
        nodeName: "StringifyFileNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [330, 130],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "in",
                type: "file",
                label: "file",
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
                throw new Error("No file provided.");
            }

            return {
                out: JSON.stringify(result, null, 2),
            };
        },
    }
);

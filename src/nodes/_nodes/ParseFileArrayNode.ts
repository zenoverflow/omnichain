import { makeNode } from "./_Base";

const doc = [
    //
    "Parse an array of files from a JSON string.",
]
    .join(" ")
    .trim();

export const ParseFileArrayNode = makeNode(
    {
        nodeName: "ParseFileArrayNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [330, 130],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "in",
                type: "string",
                label: "string (json)",
            },
        ],
        outputs: [
            //
            {
                name: "out",
                type: "fileArray",
                label: "files (array)",
            },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);

            const strIn = (inputs.in || [])[0];

            if (!strIn) {
                throw new Error("Missing string input or empty string.");
            }

            return {
                out: JSON.parse(strIn),
            };
        },
    }
);

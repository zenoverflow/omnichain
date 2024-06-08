import { makeNode } from "./_Base";

const doc = [
    //
    "Encodes text content into a base64 string.",
]
    .join(" ")
    .trim();

export const EncodeBase64Node = makeNode(
    {
        nodeName: "EncodeBase64Node",
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
                label: "text (string)",
            },
        ],
        outputs: [
            //
            {
                name: "out",
                type: "string",
                label: "result (string - base64)",
            },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);

            const strBase = (inputs.in || [])[0] || "";

            return {
                out: Buffer.from(strBase).toString("base64"),
            };
        },
    }
);

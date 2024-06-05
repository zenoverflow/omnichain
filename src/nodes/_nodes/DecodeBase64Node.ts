import { makeNode } from "./_Base";

const doc = [
    //
    "Takes a base64 string, and decodes it into text content.",
]
    .join(" ")
    .trim();

export const DecodeBase64Node = makeNode(
    {
        nodeName: "DecodeBase64Node",
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
                label: "text (string - base64)",
            },
        ],
        outputs: [
            //
            {
                name: "out",
                type: "string",
                label: "result (string)",
            },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);

            const strBase64 = (inputs.in || [])[0] || "";

            if (!strBase64) {
                throw new Error("Missing file!");
            }

            return {
                out: Buffer.from(strBase64, "base64").toString("utf-8"),
            };
        },
    }
);

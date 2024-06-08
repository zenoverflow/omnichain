import officeParser from "officeparser";

import type { ChatMessageFile } from "../../data/types";

import { makeNode } from "./_Base";

const doc = [
    //
    "Extracts text from an office file.",
    "Expects a native OmniChain file object as input.",
    "Supports: docx, pptx, xlsx, odt, odp, ods, pdf",
]
    .join(" ")
    .trim();

export const ExtractOfficeFileText = makeNode(
    {
        nodeName: "ExtractOfficeFileText",
        nodeIcon: "FileTextOutlined",
        dimensions: [330, 130],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "file",
                type: "file",
                label: "file",
            },
        ],
        outputs: [
            //
            {
                name: "text",
                type: "string",
                label: "text",
            },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);

            const file: ChatMessageFile | undefined = (inputs.file || [])[0];

            if (!file) {
                throw new Error("Missing file input");
            }

            const bfr = Buffer.from(file.content, "base64");

            return {
                text: await officeParser.parseOfficeAsync(bfr),
            };
        },
    }
);

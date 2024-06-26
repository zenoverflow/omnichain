import officeParser from "officeparser";

import type { ChatMessageFile } from "../../data/types";

import { makeNode } from "./_Base";

const doc = [
    //
    "Extracts text from an office file.",
    "Expects a native OmniChain file object as input.",
    "Supports: docx, pptx, xlsx, odt, odp, ods, pdf.",
    "If a plain text file is passed, the content will simply be decoded as UTF-8.",
    "If an unsupported file type is passed, the content will be returned as is.",
]
    .join(" ")
    .trim();

const SUPPORTED_MIME_TYPES = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.oasis.opendocument.presentation",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/pdf",
];

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

            if (!SUPPORTED_MIME_TYPES.includes(file.mimetype)) {
                // throw new Error(`Unsupported file type: ${file.mimetype}`);
                if (file.mimetype.startsWith("text/")) {
                    return {
                        text: Buffer.from(file.content, "base64").toString(
                            "utf-8"
                        ),
                    };
                }
                return {
                    text: file.content,
                };
            }

            const bfr = Buffer.from(file.content, "base64");

            return {
                text: await officeParser.parseOfficeAsync(bfr),
            };
        },
    }
);

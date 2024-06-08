import officeParser from "officeparser";

import type { ChatMessageFile } from "../../data/types";

import { makeNode } from "./_Base";

const doc = [
    //
    "Extracts text from an array of office files.",
    "Expects an array of native OmniChain file objects as input.",
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

export const ExtractOfficeFileTextMultiNode = makeNode(
    {
        nodeName: "ExtractOfficeFileTextMultiNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [330, 130],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "files",
                type: "fileArray",
                label: "files (array)",
            },
        ],
        outputs: [
            //
            {
                name: "results",
                type: "stringArray",
                label: "results (array)",
            },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);

            const files: ChatMessageFile[] = (inputs.file || [])[0] || [];

            const results: string[] = [];
            for (const file of files) {
                if (!SUPPORTED_MIME_TYPES.includes(file.mimetype)) {
                    // throw new Error(`Unsupported file type: ${file.mimetype}`);
                    if (file.mimetype.startsWith("text/")) {
                        results.push(
                            Buffer.from(file.content, "base64").toString(
                                "utf-8"
                            )
                        );
                    }
                    results.push(file.content);
                }

                const bfr = Buffer.from(file.content, "base64");
                results.push(await officeParser.parseOfficeAsync(bfr));
            }

            return { results };
        },
    }
);

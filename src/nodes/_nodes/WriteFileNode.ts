import { makeNode } from "./_Base";

import type { ChatMessageFile } from "../../data/types";

const doc = [
    //
    "Writes a file to disk at a specified location.",
]
    .join(" ")
    .trim();

export const WriteFileNode = makeNode(
    {
        nodeName: "WriteFileNode",
        nodeIcon: "FileOutlined",
        dimensions: [300, 250],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "triggerIn",
                type: "trigger",
                label: "trigger in",
            },
            {
                name: "fileIn",
                type: "file",
                label: "file",
            },
            {
                name: "path",
                type: "string",
                label: "path (string)",
            },
        ],
        outputs: [
            //
            {
                name: "triggerOut",
                type: "trigger",
                label: "trigger out",
            },
        ],
        controls: [],
    },
    {
        async controlFlow(nodeId, context) {
            try {
                const inputs = await context.fetchInputs(nodeId);

                const fileToWrite: ChatMessageFile | undefined =
                    (inputs.fileIn || [])[0];

                const path = (inputs.path || [])[0];

                if (!fileToWrite || !path) {
                    throw new Error("Missing file or path!");
                }

                await context.onExternalAction({
                    type: "writeFile",
                    args: {
                        path,
                        content: fileToWrite.content,
                    },
                });

                return "triggerOut";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);

import { makeNode } from "./_Base";

import type { ChatMessageFile } from "../../data/types";

const doc = [
    //
    "Grab a file's content.",
]
    .join(" ")
    .trim();

export const GetFileContentNode = makeNode(
    {
        nodeName: "GetFileContentNode",
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
                label: "content (string - base64)",
            },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);

            const theFile: ChatMessageFile | undefined = (inputs.in || [])[0];

            if (!theFile) {
                throw new Error("Missing file!");
            }

            return {
                out: theFile.content,
            };
        },
    }
);

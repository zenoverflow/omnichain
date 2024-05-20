import { makeNode } from "./_Base";

import type { ChatMessageFile } from "../../data/types";

const doc = [
    //
    "Grab a file's mimetype.",
]
    .join(" ")
    .trim();

export const GetFileMimeTypeNode = makeNode(
    {
        nodeName: "GetFileMimeTypeNode",
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
                label: "mimetype (string)",
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
                out: theFile.mimetype,
            };
        },
    }
);

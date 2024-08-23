import db from "mime-db";

import type { ChatMessage } from "../../data/types";

import { makeNode } from "./_Base";

const doc = [
    "Reads the current user message's files from the session.",
    "The message must first be saved to the session using",
    "the AwaitNextMessage node. Consecutive use of this node",
    "will return text from the same message until a new one is saved.",
]
    .join(" ")
    .trim();

export const ReadCurrentMessageFilesNode = makeNode(
    {
        nodeName: "ReadCurrentMessageFilesNode",
        nodeIcon: "FileOutlined",
        dimensions: [1100, 140],
        doc,
    },
    {
        inputs: [],
        outputs: [{ name: "files", type: "fileArray", label: "files" }],
        controls: [
            {
                name: "type",
                control: {
                    type: "select",
                    defaultValue: "*/*",
                    config: {
                        label: "MIME type",
                        showSearch: true,
                        values: [
                            {
                                label: "*/*",
                                value: "*/*",
                            },
                            ...Object.keys(db).map((key) => ({
                                value: key,
                                label: key,
                            })),
                        ],
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const controls = context.getAllControls(nodeId);

            const msg: ChatMessage | null = await context.extraAction({
                type: "readCurrentMessage",
            });
            return {
                files:
                    msg?.files.filter((file) => {
                        if (controls.type === "*/*") {
                            return true;
                        }
                        return file.mimetype === controls.type;
                    }) ?? [],
            };
        },
    }
);

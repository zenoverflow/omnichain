import db from "mime-db";
import { makeNode } from "./_Base";
import type { ChatMessage } from "../../data/types";

const doc = [
    "Reads the current message's files from the session.",
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
        dimensions: [300, 140],
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
        async dataFlow(node, context) {
            const controls = context.getAllControls(node.id);

            const msg: ChatMessage | null = await context.onExternalAction({
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

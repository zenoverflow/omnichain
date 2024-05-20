import db from "mime-db";

import { makeNode } from "./_Base";

import type { ChatMessageFile } from "../../data/types";

const doc = [
    //
    "Create a chain-compatible file object.",
]
    .join(" ")
    .trim();

export const BuildFileNode = makeNode(
    {
        nodeName: "BuildFileNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [330, 180],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "name",
                type: "string",
                label: "name (string)",
            },
            {
                name: "content",
                type: "string",
                label: "content (string - base64)",
            },
        ],
        outputs: [
            //
            {
                name: "out",
                type: "file",
                label: "file",
            },
        ],
        controls: [
            {
                name: "mimetype",
                control: {
                    type: "select",
                    defaultValue: "text/plain",
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
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getAllControls(nodeId);

            const name = (inputs.name || [])[0];
            const content = (inputs.content || [])[0];

            if (!name || !content) {
                throw new Error("Missing name or content!");
            }

            const result: ChatMessageFile = {
                name,
                content,
                mimetype: controls.mimetype as string,
            };

            return {
                out: result,
            };
        },
    }
);

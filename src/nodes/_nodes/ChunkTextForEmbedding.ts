import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { makeNode } from "./_Base";

const doc = [
    //
    "Split text into chunks suitable for generating embeddings.",
]
    .join(" ")
    .trim();

export const ChunkTextForEmbedding = makeNode(
    {
        nodeName: "ChunkTextForEmbedding",
        nodeIcon: "OrderedListOutlined",
        dimensions: [350, 230],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "text",
                type: "string",
                label: "text",
            },
        ],
        outputs: [
            //
            {
                name: "chunks",
                type: "stringArray",
                label: "chunks",
            },
        ],
        controls: [
            {
                name: "size",
                control: {
                    type: "number",
                    defaultValue: 1000,
                    config: {
                        label: "chunk characters",
                        min: 1,
                    },
                },
            },
            {
                name: "overlap",
                control: {
                    type: "number",
                    defaultValue: 200,
                    config: {
                        label: "overlap characters",
                        min: 0,
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getAllControls(nodeId);

            const text: string = (inputs.text || [])[0] || "";

            const size = controls.size as number;
            const overlap = controls.overlap as number;

            const spl = new RecursiveCharacterTextSplitter({
                chunkSize: size,
                chunkOverlap: overlap,
            });

            return {
                chunks: await spl.splitText(text),
            };
        },
    }
);

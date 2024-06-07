import lancedb, { WriteMode } from "vectordb";

import { makeNode } from "./_Base";

const doc = [
    "Creates a table in a LanceDB database at the specified location.",
    "You pass in the texts and the embeddings for each piece of text",
    "as separate arrays. The texts and embeddings arrays must be the same length.",
    "Make sure the arrays are in the right order!",
    "The embeddings are expected to be an array of stringified JSON number arrays.",
]
    .join(" ")
    .trim();

export const LanceDBCreateTable = makeNode(
    {
        nodeName: "LanceDBCreateTable",
        nodeIcon: "DatabaseOutlined",
        dimensions: [580, 370],
        doc,
    },
    {
        inputs: [
            { name: "triggerIn", type: "trigger", label: "trigger in" },
            { name: "uri", type: "string", label: "db location" },
            { name: "table", type: "string", label: "table name" },
            { name: "texts", type: "stringArray", label: "texts (array)" },
            {
                name: "embeddings",
                type: "stringArray",
                label: "embeddings (array)",
            },
        ],
        outputs: [
            { name: "triggerOut", type: "trigger", label: "trigger out" },
        ],
        controls: [
            {
                name: "overwrite",
                control: {
                    type: "select",
                    defaultValue: "true",
                    config: {
                        label: "overwrite",
                        values: [
                            { value: "true", label: "true" },
                            { value: "false", label: "false" },
                        ],
                    },
                },
            },
        ],
    },
    {
        async controlFlow(nodeId, context, _trigger) {
            try {
                const inputs = await context.fetchInputs(nodeId);
                const controls = context.getAllControls(nodeId);

                const uri = (inputs.uri || [])[0];
                const table = (inputs.table || [])[0];
                const texts: string[] = (inputs.texts || [])[0] || [];
                const embeddings: string[] = (inputs.embeddings || [])[0] || [];

                if (!uri) {
                    throw new Error("uri is required");
                }
                if (!table) {
                    throw new Error("table is required");
                }
                if (texts.length !== embeddings.length) {
                    throw new Error(
                        "texts and embeddings must be the same length"
                    );
                }

                const db = await lancedb.connect({
                    uri,
                    readConsistencyInterval: 0,
                });
                await db.createTable(
                    table,
                    texts.map((text, i) => ({
                        vector: JSON.parse(embeddings[i]),
                        item: text,
                    })),
                    {
                        writeMode:
                            controls.overwrite === "true"
                                ? WriteMode.Overwrite
                                : WriteMode.Create,
                    }
                );

                return "triggerOut";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);

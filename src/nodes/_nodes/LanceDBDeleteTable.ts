import lancedb from "vectordb";

import { makeNode } from "./_Base";

const doc = [
    "Deletes a table from a LanceDB database at the specified location.",
]
    .join(" ")
    .trim();

export const LanceDBDeleteTable = makeNode(
    {
        nodeName: "LanceDBDeleteTable",
        nodeIcon: "DatabaseOutlined",
        dimensions: [580, 250],
        doc,
    },
    {
        inputs: [
            { name: "triggerIn", type: "trigger", label: "trigger in" },
            { name: "uri", type: "string", label: "db location" },
            { name: "table", type: "string", label: "table name" },
        ],
        outputs: [
            { name: "triggerOut", type: "trigger", label: "trigger out" },
        ],
        controls: [],
    },
    {
        async controlFlow(nodeId, context, _trigger) {
            try {
                const inputs = await context.fetchInputs(nodeId);
                // const controls = context.getAllControls(nodeId);

                const uri = (inputs.uri || [])[0];
                const table = (inputs.table || [])[0];

                if (!uri) {
                    throw new Error("uri is required");
                }
                if (!table) {
                    throw new Error("table is required");
                }

                const db = await lancedb.connect({
                    uri,
                    readConsistencyInterval: 0,
                });
                await db.dropTable(table);

                return "triggerOut";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);

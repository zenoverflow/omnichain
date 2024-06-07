import lancedb, { MetricType } from "vectordb";

import { makeNode } from "./_Base";

const doc = [
    "Queries a table in a LanceDB database at the specified location.",
    "The embedding is expected to be a stringified JSON number array.",
    "You can make this embedding using one of the embedding nodes.",
]
    .join(" ")
    .trim();

export const LanceDBQueryTable = makeNode(
    {
        nodeName: "LanceDBQueryTable",
        nodeIcon: "DatabaseOutlined",
        dimensions: [580, 300],
        doc,
    },
    {
        inputs: [
            { name: "uri", type: "string", label: "db location" },
            { name: "table", type: "string", label: "table name" },
            {
                name: "embedding",
                type: "string",
                label: "embedding (json array)",
            },
        ],
        outputs: [
            { name: "results", type: "stringArray", label: "results (array)" },
        ],
        controls: [
            {
                name: "metric",
                control: {
                    type: "select",
                    defaultValue: "l2",
                    config: {
                        label: "metric",
                        values: [
                            { value: "l2", label: "l2" },
                            { value: "cosine", label: "cosine" },
                            { value: "dot", label: "dot" },
                        ],
                    },
                },
            },
            {
                name: "limit",
                control: {
                    type: "number",
                    defaultValue: 10,
                    config: {
                        label: "limit",
                        min: 1,
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getAllControls(nodeId);

            const uri = (inputs.uri || [])[0];
            const table = (inputs.table || [])[0];
            const embedding = (inputs.embedding || [])[0];

            if (!uri) {
                throw new Error("uri is required");
            }
            if (!table) {
                throw new Error("table is required");
            }
            if (!embedding) {
                throw new Error("embedding is required");
            }

            const metric = (() => {
                switch (controls.metric) {
                    case "l2":
                        return MetricType.L2;
                    case "cosine":
                        return MetricType.Cosine;
                    case "dot":
                        return MetricType.Dot;
                    default:
                        throw new Error("invalid metric");
                }
            })();

            const db = await lancedb.connect({
                uri,
                readConsistencyInterval: 0,
            });
            const tbl = await db.openTable(table);
            const results = await tbl
                .search(JSON.parse(embedding))
                .metricType(metric)
                .limit(controls.limit as number)
                .execute();

            return {
                results: results.map((r) => r.item),
            };
        },
    }
);

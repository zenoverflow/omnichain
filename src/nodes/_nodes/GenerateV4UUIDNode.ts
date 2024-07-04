import { v4 as uuid } from "uuid";

import { makeNode } from "./_Base";

const doc = [
    //
    "Generates a UUID v4 using the uuid npm package.",
]
    .join(" ")
    .trim();

export const GenerateV4UUIDNode = makeNode(
    {
        nodeName: "GenerateV4UUIDNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [350, 110],
        doc,
    },
    {
        inputs: [],
        outputs: [
            {
                name: "result",
                type: "string",
                label: "uuid (string)",
            },
        ],
        controls: [],
    },
    {
        async dataFlow(_nodeId, _context) {
            return { result: uuid() };
        },
    }
);

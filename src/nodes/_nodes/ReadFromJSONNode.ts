import { makeNode } from "./_Base";

const doc = [
    "Extracts data from a JSON string using a path text input.",
    "Path example: 'data.nestedData[0].value'.",
    "Warning: bracket access format like data.nestedData[0]['value']",
    "is not supported! Using it with this node will throw an error!",
]
    .join(" ")
    .trim();

export const ReadFromJSONNode = makeNode(
    {
        nodeName: "ReadFromJSONNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [580, 180],
        doc,
    },
    {
        inputs: [
            { name: "jsonStr", type: "string", label: "string (json)" },
            { name: "path", type: "string", label: "path" },
        ],
        outputs: [
            //
            { name: "data", type: "string", label: "data" },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const jsonStr = (inputs.jsonStr || [])[0];
            const path = (inputs.path || [])[0];

            if (!jsonStr || !path) {
                throw new Error("Missing required inputs!");
            }

            const dataObj = JSON.parse(jsonStr);

            let data: any = dataObj;

            for (const segment of path.split(".")) {
                // check if segment does array access like [0]
                const match = segment.match(/(\w+)\[(\d+)\]/);
                if (match) {
                    const [, key, index] = match;
                    data = data[key][parseInt(index)];
                } else {
                    data = data[segment];
                }
            }

            return { data: JSON.stringify(data) };
        },
    }
);

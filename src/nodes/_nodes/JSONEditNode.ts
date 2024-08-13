import { makeNode } from "./_Base";

const doc = [
    "Edits part of a JSON string using a path text input.",
    "Path example: 'data.nestedData[0].value'.",
    "Warning: bracket access format like data.nestedData[0]['value']",
    "is not supported! Using it with this node will throw an error!",
    "The value input will be parsed according to the 'value type' control.",
    "If the value type is set to null, you don't need to provide",
    "a value in the 'value' input.",
]
    .join(" ")
    .trim();

export const JSONEditNode = makeNode(
    {
        nodeName: "JSONEditNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [330, 290],
        doc,
    },
    {
        inputs: [
            { name: "jsonStr", type: "string", label: "string (json)" },
            { name: "path", type: "string", label: "path" },
            { name: "value", type: "string", label: "value" },
        ],
        outputs: [
            //
            { name: "data", type: "string", label: "data" },
        ],

        controlsOverride: {
            value_type: "valueType",
        },
        controls: [
            {
                name: "valueType",
                control: {
                    type: "select",
                    defaultValue: "string",
                    config: {
                        label: "value type",
                        values: [
                            { value: "string", label: "string" },
                            { value: "number", label: "number" },
                            { value: "boolean", label: "boolean" },
                            { value: "json", label: "json" },
                            { value: "null", label: "null" },
                        ],
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getControlsWithOverride(nodeId, inputs);

            const jsonStr = (inputs.jsonStr || [])[0];
            const path = (inputs.path || [])[0];
            const value = (inputs.value || [])[0];

            if (!jsonStr || !path) {
                throw new Error("Missing required inputs!");
            }

            let toSet: any = value;

            switch (controls.valueType) {
                case "number":
                    toSet = parseFloat(value);
                    break;
                case "boolean":
                    toSet = value === "true";
                    break;
                case "null":
                    toSet = null;
                    break;
                case "json":
                    toSet = JSON.parse(value);
                    break;
                default:
                    toSet = value;
            }

            const dataObj = JSON.parse(jsonStr);

            let data: any = dataObj;

            const segments: string[] = path.split(".");

            segments.forEach((segment, segIndex) => {
                // check if segment does array access like [0]
                const match = segment.match(/(\w+)\[(\d+)\]/);

                const isLastSegment = segIndex === segments.length - 1;

                if (match) {
                    const [, key, accessIndex] = match;

                    // if the index is the last segment set the value
                    if (isLastSegment) {
                        data[key][parseInt(accessIndex)] = toSet;
                    }
                    // otherwise continue traversing
                    else {
                        data = data[key][parseInt(accessIndex)];
                    }
                } else {
                    // if the segment is the last segment set the value
                    if (isLastSegment) {
                        data[segment] = toSet;
                    }
                    // otherwise continue traversing
                    else {
                        data = data[segment];
                    }
                }
            });

            return {
                data: JSON.stringify(dataObj, null, 2),
            };
        },
    }
);

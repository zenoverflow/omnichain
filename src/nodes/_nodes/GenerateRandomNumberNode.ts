import { makeNode } from "./_Base";

import { RandomNumberUtils } from "../../util/RandomNumberUtils";

const doc = [
    //
    "Generates a random number in a specified range.",
]
    .join(" ")
    .trim();

export const GenerateRandomNumberNode = makeNode(
    {
        nodeName: "GenerateRandomNumberNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [350, 270],
        doc,
    },
    {
        inputs: [],
        outputs: [
            {
                name: "result",
                type: "string",
                label: "result (number as string)",
            },
        ],

        controlsOverride: {
            min: "min",
            max: "max",
            type: "type",
        },
        controls: [
            {
                name: "min",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "min",
                    },
                },
            },
            {
                name: "max",
                control: {
                    type: "number",
                    defaultValue: 100,
                    config: {
                        label: "max",
                    },
                },
            },
            {
                name: "type",
                control: {
                    type: "select",
                    defaultValue: "integer",
                    config: {
                        label: "type",
                        values: [
                            { value: "integer", label: "integer" },
                            { value: "float", label: "float" },
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

            const min = controls.min as number;
            const max = controls.max as number;
            const type = controls.type as string;

            if (min > max) {
                throw new Error(
                    "GenerateRandomNumberNode: min cannot be greater than max!"
                );
            }

            if (type === "float") {
                return {
                    result: RandomNumberUtils.arbitrary(min, max).toString(),
                };
            }

            return {
                result: RandomNumberUtils.integer(min, max).toString(),
            };
        },
    }
);

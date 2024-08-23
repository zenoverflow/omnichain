import { makeNode } from "./_Base";

import { RandomNumberUtils } from "../../util/RandomNumberUtils";

export const PickStringArrayItemRandomNode = makeNode(
    {
        nodeName: "PickStringArrayItemRandomNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [390, 280],
        doc: "Pick a random item from a file array.",
    },
    {
        inputs: [{ name: "array", type: "stringArray", label: "array" }],
        outputs: [{ name: "string", type: "string", label: "string" }],

        controlsOverride: {
            min: "min",
            max: "max",
        },
        controls: [
            {
                name: "min",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "min",
                        min: 0,
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
                        min: 0,
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getControlsWithOverride(nodeId, inputs);

            const array: any[] = (inputs["array"] ?? [])[0] ?? [];

            const index = RandomNumberUtils.integer(
                controls.min as number,
                controls.max as number
            );

            const result = array[index];

            if (!result) {
                throw new Error("PickStringArrayItemRandomNode: Invalid index");
            }

            return {
                string: result,
            };
        },
    }
);
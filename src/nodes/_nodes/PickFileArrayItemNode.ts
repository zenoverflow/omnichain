import { makeNode } from "./_Base";

export const PickFileArrayItemNode = makeNode(
    {
        nodeName: "PickFileArrayItemNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [330, 220],
        doc: "Pick an item from a file array by index.",
    },
    {
        inputs: [{ name: "array", type: "fileArray", label: "array" }],
        outputs: [{ name: "file", type: "file", label: "file" }],

        controlsOverride: {
            index: "index",
        },
        controls: [
            {
                name: "index",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "index",
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

            const index = controls.index as number;

            const normalizedIndex = index >= 0 ? index : array.length + index;

            const result = array[normalizedIndex];

            if (!result) {
                throw new Error("PickFileArrayItemNode: Invalid index");
            }

            return {
                file: result,
            };
        },
    }
);

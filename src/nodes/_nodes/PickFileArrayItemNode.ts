import { makeNode } from "./_Base";

export const PickFileArrayItemNode = makeNode(
    {
        nodeName: "PickFileArrayItemNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [300, 175],
        doc: "Pick an item from a file array by index.",
    },
    {
        inputs: [{ name: "array", type: "fileArray", label: "array" }],
        outputs: [{ name: "file", type: "file", label: "file" }],
        controls: [
            {
                name: "index",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "index",
                        min: 0,
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs!(nodeId);
            const controls = context.getAllControls(nodeId);

            const array = (inputs["array"] ?? [])[0] ?? [];
            return {
                file: array[controls.index as number],
            };
        },
    }
);

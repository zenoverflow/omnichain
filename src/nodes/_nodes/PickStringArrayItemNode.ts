import { makeNode } from "./_Base";

export const PickStringArrayItemNode = makeNode(
    {
        nodeName: "PickStringArrayItemNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [300, 175],
        doc: "Pick an item from a string array by index.",
    },
    {
        inputs: [{ name: "array", type: "stringArray", label: "array" }],
        outputs: [{ name: "string", type: "string", label: "string" }],
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
                string: array[controls.index as number],
            };
        },
    }
);

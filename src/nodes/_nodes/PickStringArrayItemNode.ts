import { makeNode } from "./_Base";

export const PickStringArrayItemNode = makeNode(
    {
        nodeName: "PickStringArrayItemNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [300, 175],
        doc: "Block or unblock user's ability to send new chat messages.",
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
                    },
                },
            },
        ],
    },
    {
        dataFlow: {
            inputs: ["array"],
            outputs: ["string"],
            async logic(_node, _context, controls, fetchInputs) {
                const inputs = await fetchInputs();
                const array = (inputs["array"] ?? [])[0] ?? [];
                return {
                    string: array[controls.index],
                };
            },
        },
    }
);

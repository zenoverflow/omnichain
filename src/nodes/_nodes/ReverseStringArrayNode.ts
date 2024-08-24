import { makeNode } from "./_Base";

export const ReverseStringArrayNode = makeNode(
    {
        nodeName: "ReverseStringArrayNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [330, 130],
        doc: "Reverse a file array.",
    },
    {
        inputs: [
            //
            {
                name: "array",
                type: "stringArray",
                label: "array",
            },
        ],
        outputs: [
            //
            {
                name: "array",
                type: "stringArray",
                label: "array (reversed)",
            },
        ],

        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);

            const array: any[] = (inputs["array"] || [])[0] ?? [];

            return {
                array: array.slice().reverse(),
            };
        },
    }
);

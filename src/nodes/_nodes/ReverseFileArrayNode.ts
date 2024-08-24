import { makeNode } from "./_Base";

export const ReverseFileArrayNode = makeNode(
    {
        nodeName: "ReverseFileArrayNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [330, 130],
        doc: "Reverse a file array.",
    },
    {
        inputs: [
            //
            {
                name: "array",
                type: "fileArray",
                label: "array",
            },
        ],
        outputs: [
            //
            {
                name: "array",
                type: "fileArray",
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

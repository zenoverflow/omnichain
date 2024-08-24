import { makeNode } from "./_Base";

export const ReverseChatMessageArrayNode = makeNode(
    {
        nodeName: "ReverseChatMessageArrayNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [330, 130],
        doc: "Reverse a chat message array.",
    },
    {
        inputs: [
            //
            {
                name: "array",
                type: "chatMessageArray",
                label: "array",
            },
        ],
        outputs: [
            //
            {
                name: "array",
                type: "chatMessageArray",
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

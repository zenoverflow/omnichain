import { makeNode } from "./_Base";

const doc = [
    //
    "Make an array from chat messages, or append messages to an",
    "existing array. This node is useful for collecting chat messages.",
    "If no inputs are connected, the node will output an empty array.",
]
    .join(" ")
    .trim();

export const ArrayFromChatMessageNode = makeNode(
    {
        nodeName: "ArrayFromChatMessageNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [300, 210],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "sourceArr",
                type: "chatMessageArray",
                label: "messages (array)",
            },
            {
                name: "sourceMsg1",
                type: "chatMessage",
                label: "message (single)",
            },
            {
                name: "sourceMsg2",
                type: "chatMessage",
                label: "message2 (single)",
            },
        ],
        outputs: [
            //
            {
                name: "outArr",
                type: "chatMessageArray",
                label: "result (array)",
            },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);

            const sourceArr = (inputs.sourceArr || [])[0] || [];
            const sourceMsg1 = (inputs.sourceMsg1 || [])[0];
            const sourceMsg2 = (inputs.sourceMsg2 || [])[0];

            const result = [...sourceArr];

            if (sourceMsg1) result.push(sourceMsg1);
            if (sourceMsg2) result.push(sourceMsg2);

            return {
                outArr: result,
            };
        },
    }
);

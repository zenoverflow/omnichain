import { makeNode } from "./_Base";

const doc = [
    //
    "Use to route chat message connections.",
]
    .join(" ")
    .trim();

export const RouteChatMessageNode = makeNode(
    {
        nodeName: "RouteChatMessageNode",
        nodeIcon: "BranchesOutlined",
        dimensions: [330, 130],
        doc,
    },
    {
        inputs: [
            //
            { name: "in", type: "chatMessage", label: "in" },
        ],
        outputs: [
            //
            { name: "out", type: "chatMessage", label: "out" },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const message = (inputs.in || [])[0];

            if (!message) {
                throw new Error("No message input.");
            }

            return {
                out: message,
            };
        },
    }
);

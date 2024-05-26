import { makeNode } from "./_Base";

const doc = [
    //
    "Get an existing ephemeral storage for chat messages by its ID.",
]
    .join(" ")
    .trim();

export const ChatStoreGetNode = makeNode(
    {
        nodeName: "ChatStoreGetNode",
        nodeIcon: "CodeOutlined",
        dimensions: [330, 170],
        doc,
    },
    {
        inputs: [
            //
            { name: "storeId", type: "string", label: "store ID" },
        ],
        outputs: [
            //
            { name: "messages", type: "chatMessageArray", label: "messages" },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);

            const storeId = (inputs.storeId || [])[0] || "";

            if (!storeId?.length) {
                throw new Error("No store ID provided.");
            }

            const messages = await context.extraAction({
                type: "getChatStore",
                args: { id: storeId },
            });

            // console.log("---");
            // console.log(messages);
            // console.log("---");

            return { messages };
        },
    }
);

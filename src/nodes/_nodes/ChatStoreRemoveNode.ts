import { makeNode } from "./_Base";

const doc = [
    //
    "Remove an existing ephemeral storage for chat messages by its ID.",
]
    .join(" ")
    .trim();

export const ChatStoreRemoveNode = makeNode(
    {
        nodeName: "ChatStoreRemoveNode",
        nodeIcon: "CodeOutlined",
        dimensions: [330, 170],
        doc,
    },
    {
        inputs: [
            //
            { name: "triggerIn", type: "trigger", label: "trigger in" },
            { name: "storeId", type: "string", label: "store ID" },
        ],
        outputs: [
            //
            { name: "triggerOut", type: "trigger", label: "trigger out" },
        ],
        controls: [],
    },
    {
        async controlFlow(nodeId, context) {
            try {
                const inputs = await context.fetchInputs(nodeId);

                const storeId = (inputs.storeId || [])[0] || "";

                if (!storeId?.length) {
                    throw new Error("No store ID provided.");
                }
                await context.extraAction({
                    type: "rmChatStore",
                    args: { id: storeId },
                });

                return "triggerOut";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);

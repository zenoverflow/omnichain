import { makeNode } from "./_Base";

const doc = [
    //
    "Add a new message to an existing ephemeral storage for chat messages by its ID.",
]
    .join(" ")
    .trim();

export const ChatStoreAppendNode = makeNode(
    {
        nodeName: "ChatStoreAppendNode",
        nodeIcon: "CodeOutlined",
        dimensions: [330, 250],
        doc,
    },
    {
        inputs: [
            //
            { name: "triggerIn", type: "trigger", label: "trigger in" },
            { name: "storeId", type: "string", label: "store ID" },
            { name: "message", type: "chatMessage", label: "message" },
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
                const message = (inputs.message || [])[0];

                if (!storeId?.length) {
                    throw new Error("No store ID provided.");
                }

                if (!message) {
                    throw new Error("No message provided.");
                }

                await context.extraAction({
                    type: "addMessageToChatStore",
                    args: { id: storeId, message },
                });

                return "triggerOut";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);

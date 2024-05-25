import { makeNode } from "./_Base";

const doc = [
    //
    "Create an ephemeral storage for chat messages and return its ID.",
    "If an old ID exists, no new store will be created.",
]
    .join(" ")
    .trim();

export const ChatStoreInitNode = makeNode(
    {
        nodeName: "ChatStoreInitNode",
        nodeIcon: "CodeOutlined",
        dimensions: [330, 170],
        doc,
    },
    {
        inputs: [],
        outputs: [
            //
            { name: "storeId", type: "string", label: "store ID" },
        ],
        controls: [
            {
                name: "oldId",
                control: {
                    type: "text",
                    defaultValue: "",
                    readOnly: true,
                    config: {
                        label: "Old ID",
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            // const inputs = await context.fetchInputs(nodeId);
            const controls = context.getAllControls(nodeId);

            const oldId = controls.oldId as string;

            if (oldId.length) {
                const oldStore = await context.extraAction({
                    type: "getChatStore",
                    args: { id: oldId },
                });
                if (oldStore) {
                    return { storeId: oldId };
                }
            }

            const storeId = await context.extraAction({
                type: "mkChatStore",
            });

            await context.updateControl(nodeId, "oldId", storeId);

            return { storeId };
        },
    }
);

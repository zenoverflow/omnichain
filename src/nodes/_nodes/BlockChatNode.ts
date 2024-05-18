import { makeNode } from "./_Base";

export const BlockChatNode = makeNode(
    {
        nodeName: "BlockChatNode",
        nodeIcon: "PauseCircleOutlined",
        dimensions: [300, 210],
        doc: "Block or unblock user's ability to send new chat messages.",
    },
    {
        inputs: [{ name: "triggerIn", type: "trigger", label: "trigger-in" }],
        outputs: [
            { name: "triggerOut", type: "trigger", label: "trigger-out" },
        ],
        controls: [
            {
                name: "action",
                control: {
                    type: "select",
                    defaultValue: "block",
                    config: {
                        values: [
                            { value: "block", label: "Block" },
                            { value: "unblock", label: "Unblock" },
                        ],
                    },
                },
            },
        ],
    },
    {
        async controlFlow(nodeId, context) {
            try {
                const action = context.getAllControls(nodeId)["action"] as
                    | "block"
                    | "unblock";

                await context.onExternalAction({
                    type: "chatBlock",
                    args: { blocked: action === "block" },
                });

                return "triggerOut";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);

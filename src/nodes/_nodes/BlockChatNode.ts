import { makeNode } from "./_Base";

export const BlockChatNode = makeNode(
    {
        nodeName: "BlockChatNode",
        nodeIcon: "PauseCircleOutlined",
        dimensions: [300, 175],
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
        controlFlow: {
            inputs: ["triggerIn"],
            outputs: ["triggerOut"],
            async logic(_node, context, controls, _fetchInputs, forward) {
                const action = controls["action"] as "block" | "unblock";

                await context.onExternalAction({
                    type: "chatBlock",
                    args: { blocked: action === "block" },
                });

                forward("triggerOut");
            },
        },
    }
);

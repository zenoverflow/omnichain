import { makeNode } from "./_Base";

export const PickChatMessageArrayItemNode = makeNode(
    {
        nodeName: "PickChatMessageArrayItemNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [300, 175],
        doc: "Pick an item from a chat message array by index.",
    },
    {
        inputs: [{ name: "array", type: "chatMessageArray", label: "array" }],
        outputs: [{ name: "message", type: "chatMessage", label: "message" }],
        controls: [
            {
                name: "index",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "index",
                        min: 0,
                    },
                },
            },
        ],
    },
    {
        dataFlow: {
            inputs: ["array"],
            outputs: ["message"],
            async logic(_node, _context, controls, fetchInputs) {
                const inputs = await fetchInputs();
                const array = (inputs["array"] || [])[0] ?? [];
                const message = array[controls.index];
                if (!message) {
                    throw new Error(
                        "PickChatMessageArrayItemNode: Invalid index"
                    );
                }
                return { message };
            },
        },
    }
);

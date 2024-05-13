import { makeNode } from "./_Base";

export const TextNode = makeNode(
    {
        nodeName: "TextNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [580, 450],
        doc: "Simple text node that stores and outputs the input string.",
    },
    {
        inputs: [{ name: "in", type: "string" }],
        outputs: [{ name: "out", type: "string", multi: true }],
        controls: [
            {
                name: "val",
                control: {
                    type: "text",
                    defaultValue: "",
                    config: {
                        large: true,
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = (await context.fetchInputs!(nodeId)) as {
                in?: string[];
            };

            const oldValue = context.getAllControls(nodeId).val as string;
            const update = (inputs.in || [])[0] || oldValue;

            // Update graph
            await context.onControlChange(nodeId, "val", update);

            return { out: update };
        },
    }
);

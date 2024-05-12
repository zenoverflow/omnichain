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
        async dataFlow(node, context) {
            const inputs = (await context.fetchInputs!(node.id)) as {
                in?: string[];
            };

            const valControl = node.controls.val as any;

            valControl.value = (inputs.in || [])[0] ?? valControl.value;

            // Update graph
            await context.onControlChange(node.id, "val", valControl.value);

            return { out: valControl.value };
        },
    }
);

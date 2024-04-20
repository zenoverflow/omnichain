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
        dataFlow: {
            inputs: ["in"],
            outputs: ["out"],
            async logic(node, context, _controls, fetchInputs) {
                const inputs = (await fetchInputs()) as {
                    in?: string[];
                };

                const valControl = node.controls.val;

                valControl.value = (inputs.in || [])[0] ?? valControl.value;

                // Update graph
                context.onControlChange(
                    context.graphId,
                    node.id,
                    "val",
                    valControl.value
                );

                return { out: valControl.value };
            },
        },
    }
);

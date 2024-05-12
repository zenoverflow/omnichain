import { makeNode } from "./_Base";

export const PromptBuilderNode = makeNode(
    {
        nodeName: "PromptBuilderNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [580, 450],
        doc: "Build a prompt by combining a template with values.",
    },
    {
        inputs: [{ name: "parts", type: "templateSlot", multi: true }],
        outputs: [{ name: "prompt", type: "string", multi: true }],
        controls: [
            {
                name: "val",
                control: {
                    type: "text",
                    defaultValue: "",
                    config: { large: true },
                },
            },
        ],
    },
    {
        async dataFlow(node, context) {
            const inputs = (await context.fetchInputs!(node.id)) as {
                parts?: {
                    name: string;
                    value: string;
                }[];
            };
            const controls = context.getAllControls(node.id);

            let prompt = controls["val"] as string;

            for (const { name, value } of inputs.parts ?? []) {
                prompt = prompt.replace("{" + name + "}", value);
            }

            return { prompt };
        },
    }
);

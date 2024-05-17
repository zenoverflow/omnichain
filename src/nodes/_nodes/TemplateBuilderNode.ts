import { makeNode } from "./_Base";

export const TemplateBuilderNode = makeNode(
    {
        nodeName: "TemplateBuilderNode",
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
        async dataFlow(nodeId, context) {
            const inputs = (await context.fetchInputs!(nodeId)) as {
                parts?: {
                    name: string;
                    value: string;
                }[];
            };
            const controls = context.getAllControls(nodeId);

            let prompt = controls["val"] as string;

            for (const { name, value } of inputs.parts ?? []) {
                prompt = prompt.replace("{" + name + "}", value);
            }

            return { prompt };
        },
    }
);

import { makeNode } from "./_Base";

export const PromptBuilderNode = makeNode(
    {
        nodeName: "PromptBuilderNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [580, 450],
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
        dataFlow: {
            inputs: ["parts"],
            outputs: ["prompt"],
            async logic(node, context, controls, fetchInputs) {
                const inputs = (await fetchInputs()) as {
                    parts?: {
                        name: string;
                        value: string;
                    }[];
                };

                let prompt = controls["val"] as string;

                for (const { name, value } of inputs.parts ?? []) {
                    prompt = prompt.replaceAll("{" + name + "}", value);
                }

                return { prompt };
            },
        },
    }
);

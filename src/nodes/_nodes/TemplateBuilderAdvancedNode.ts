import { makeNode } from "./_Base";

const doc = [
    //
    "Put values into a template. Accepts connections from multiple Slot nodes.",
    "The difference between this node and the TemplateBuilderNode is that this",
    "node accepts a template as an input. Very useful for template reuse and",
    "combination/concatenation.",
]
    .join(" ")
    .trim();

export const TemplateBuilderAdvancedNode = makeNode(
    {
        nodeName: "TemplateBuilderAdvancedNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [330, 180],
        doc,
    },
    {
        inputs: [
            //
            { name: "template", type: "string" },
            { name: "parts", type: "slot", multi: true },
        ],
        outputs: [
            //
            { name: "result", type: "string" },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = (await context.fetchInputs(nodeId)) as {
                template?: string[];
                parts?: {
                    name: string;
                    value: string;
                }[];
            };

            let tmpl = (inputs.template ?? [])[0] || "";

            for (const { name, value } of inputs.parts ?? []) {
                const escaped = ("{" + name + "}").replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );
                const regex = new RegExp(escaped, "g");
                tmpl = tmpl.replace(regex, value);
            }

            return { result: tmpl };
        },
    }
);

import { makeNode } from "./_Base";

const doc = [
    "Takes a string input and combines it with the 'slot name' control",
    "to create a template slot output that can be used in a TemplateBuilder.",
]
    .join(" ")
    .trim();

export const TemplateSlotNode = makeNode(
    {
        nodeName: "TemplateSlotNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [580, 190],
        doc,
    },
    {
        inputs: [{ name: "in", type: "string" }],
        outputs: [
            {
                name: "templateSlot",
                type: "templateSlot",
                label: "template slot",
            },
        ],
        controls: [
            {
                name: "slotName",
                control: {
                    type: "text",
                    defaultValue: "slot",
                    config: {
                        label: "slot name",
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const controls = context.getAllControls(nodeId);

            const slotName = controls.slotName as string;

            if (!slotName.length) {
                throw new Error("Missing slot name in TemplateSlot!");
            }

            const inputs = await context.fetchInputs(nodeId);

            const value = (inputs.in || [])[0] || "";

            return {
                templateSlot: {
                    name: controls.slotName,
                    value,
                },
            };
        },
    }
);

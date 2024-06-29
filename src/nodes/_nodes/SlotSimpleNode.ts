import { makeNode } from "./_Base";

const doc = [
    "Takes a string input and combines it with the 'slot name' control",
    "to create a slot output that can be used, for example, in a",
    "TemplateBuilder node, or one of the JS eval nodes.",
]
    .join(" ")
    .trim();

export const SlotSimpleNode = makeNode(
    {
        nodeName: "SlotSimpleNode",
        nodeIcon: "BuildOutlined",
        dimensions: [330, 180],
        doc,
    },
    {
        inputs: [
            //
            { name: "value", type: "string", label: "value" },
        ],
        outputs: [
            {
                name: "slot",
                type: "slot",
                label: "slot",
            },
        ],
        controls: [
            {
                name: "slotName",
                control: {
                    type: "text",
                    defaultValue: "slotName",
                    config: {
                        label: "name",
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getAllControls(nodeId);

            const value: string = (inputs.value || [])[0] || "";

            const name = controls.slotName as string;

            if (!name.length) {
                throw new Error("Missing slot name!");
            }

            return {
                slot: { name, value },
            };
        },
    }
);

import { makeNode } from "./_Base";

const doc = [
    "Takes a string input and combines it with the 'slot name' control",
    "to create a slot output that can be used, for example, in a",
    "TemplateBuilder node, or one of the JS eval nodes.",
]
    .join(" ")
    .trim();

export const SlotNode = makeNode(
    {
        nodeName: "SlotNode",
        nodeIcon: "BuildOutlined",
        dimensions: [330, 190],
        doc,
    },
    {
        inputs: [
            //
            { name: "slotName", type: "string", label: "slot name" },
            { name: "value", type: "string", label: "value" },
        ],
        outputs: [
            {
                name: "slot",
                type: "slot",
                label: "slot",
            },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);

            const name: string = (inputs.slotName || [])[0] || "";
            const value: string = (inputs.value || [])[0] || "";

            if (!name.length) {
                throw new Error("Missing slot name!");
            }

            return {
                slot: { name, value },
            };
        },
    }
);

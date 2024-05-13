import { makeNode } from "./_Base";

export const TemplateSlotNode = makeNode(
    {
        nodeName: "TemplateSlotNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [580, 490],
        doc: "Create a template slot that can be used in a PromptBuilder.",
    },
    {
        inputs: [{ name: "in", type: "string" }],
        outputs: [
            {
                name: "templateSlot",
                type: "templateSlot",
                label: "template slot",
                multi: true,
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
            const controls = context.getAllControls(node.id);

            if (!(controls["slotName"] as string).length) {
                throw new Error("Missing slot name in TemplateSlot!");
            }

            const inputs = (await context.fetchInputs!(node.id)) as {
                in?: string[];
            };

            const oldValue = controls.val as string;
            const update = (inputs.in || [])[0] || oldValue;

            // Update graph
            await context.onControlChange(node.id, "val", update);

            return {
                templateSlot: {
                    name: controls["slotName"],
                    value: update,
                },
            };
        },
    }
);

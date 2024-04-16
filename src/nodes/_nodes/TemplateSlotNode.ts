import { makeNode } from "./_Base";

export const TemplateSlotNode = makeNode(
    {
        nodeName: "TemplateSlotNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [580, 490],
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
        dataFlow: {
            inputs: ["in"],
            outputs: ["templateSlot"],
            async logic(node, context, controls, fetchInputs) {
                if (!(controls["slotName"] as string).length) {
                    throw new Error("Missing slot name in TemplateSlot!");
                }

                const inputs = (await fetchInputs()) as {
                    in?: string[];
                };

                const valControl = node.controls.val;

                valControl.value = (inputs?.in || [""])[0] || valControl.value;

                // Update graph
                context.onControlChange(
                    context.graphId,
                    node.id,
                    "val",
                    valControl.value
                );

                return {
                    templateSlot: {
                        name: controls["slotName"],
                        value: valControl.value,
                    },
                };
            },
        },
    }
);

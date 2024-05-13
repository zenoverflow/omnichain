import { makeNode } from "./_Base";

export const LogOutputNode = makeNode(
    {
        nodeName: "LogOutputNode",
        nodeIcon: "CodeOutlined",
        dimensions: [580, 450],
        doc: "Grab data and display it in the node.",
    },
    {
        inputs: [
            { name: "trigger", type: "trigger" },
            { name: "data", type: "string" },
        ],
        outputs: [],
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
        async controlFlow(node, context) {
            const inputs = (await context.fetchInputs!(node.id)) as {
                data?: any[];
            };

            const oldValue = context.getAllControls(node.id).val as string;
            const update = (inputs.data || [])[0] || oldValue;

            // Update graph
            await context.onControlChange(node.id, "val", update);

            return null;
        },
    }
);

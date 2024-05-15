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
            { name: "trigger", type: "trigger", multi: true },
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
        async controlFlow(nodeId, context) {
            const inputs = (await context.fetchInputs!(nodeId)) as {
                data?: any[];
            };

            const oldValue = context.getAllControls(nodeId).val as string;
            const update = (inputs.data || [])[0] || oldValue;

            // Update graph
            await context.onControlChange(nodeId, "val", update);

            return null;
        },
    }
);

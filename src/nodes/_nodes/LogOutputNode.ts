import { makeNode } from "./_Base";

export const LogOutputNode = makeNode(
    {
        nodeName: "LogOutputNode",
        nodeIcon: "CodeOutlined",
        dimensions: [580, 480],
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
        controlFlow: {
            inputs: ["trigger"],
            outputs: [],
            async logic(node, context, _controls, fetchInputs, _forward) {
                const inputs = (await fetchInputs()) as {
                    data?: any[];
                };

                const valControl = node.controls.val;

                valControl.value = (inputs.data || [])[0] ?? valControl.value;

                // Update graph
                node.context.onControlChange(
                    context.graphId,
                    node.id,
                    "val",
                    valControl.value
                );
            },
        },
        dataFlow: {
            inputs: ["data"],
            outputs: [],
            async logic(_node, _context, _controls, _fetchInputs) {
                return {};
            },
        },
    }
);

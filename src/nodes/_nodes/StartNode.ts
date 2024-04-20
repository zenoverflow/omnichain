import { makeNode } from "./_Base";

export const StartNode = makeNode(
    {
        nodeName: "StartNode",
        nodeIcon: "PlayCircleOutlined",
        dimensions: [200, 120],
        doc: "Entrypoint that starts the flow of the chain.",
    },
    {
        inputs: [
            //
            { name: "triggerIn", type: "trigger", label: "trigger in" },
        ],
        outputs: [
            //
            { name: "triggerOut", type: "trigger", label: "trigger out" },
        ],
        controls: [],
    },
    {
        controlFlow: {
            inputs: ["triggerIn"],
            outputs: ["triggerOut"],
            async logic(_node, _context, _controls, _fetchInputs, forward) {
                forward("triggerOut");
            },
        },
    }
);

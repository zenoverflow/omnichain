import { makeNode } from "./_Base";

export const StartNode = makeNode(
    {
        nodeName: "StartNode",
        nodeIcon: "PlayCircleOutlined",
        dimensions: [200, 160],
        doc: "Entrypoint that starts the flow of the chain.",
    },
    {
        inputs: [
            //
            {
                name: "triggerIn",
                type: "trigger",
                label: "trigger in",
                multi: true,
            },
        ],
        outputs: [
            //
            { name: "triggerOut", type: "trigger", label: "trigger out" },
        ],
        controls: [],
    },
    {
        async controlFlow(_nodeId, _context) {
            return "triggerOut";
        },
    }
);

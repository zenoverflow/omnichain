import { makeNode } from "./_Base";

export const StartNode = makeNode(
    {
        nodeName: "StartNode",
        nodeIcon: "PlayCircleOutlined",
        dimensions: [200, 130],
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
        async controlFlow(_node, _context) {
            return "triggerOut";
        },
    }
);

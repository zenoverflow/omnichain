import { makeNode } from "./_Base";

const doc = [
    "Grabs text data from the 'data in' input, stores it in the node,",
    "and then fires the 'trigger out' output.",
    "Other nodes can use the 'data out' output to access the data",
    "stored in this node as many times as needed.",
    "This node will only grab new data and update itself if another",
    "node sends a signal via the 'trigger in' input.",
]
    .join(" ")
    .trim();

export const GrabTextNode = makeNode(
    {
        nodeName: "GrabTextNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [580, 585],
        doc,
    },
    {
        inputs: [
            { name: "triggerIn", type: "trigger", label: "trigger in" },
            { name: "dataIn", type: "string", label: "data in" },
        ],
        outputs: [
            { name: "triggerOut", type: "trigger", label: "trigger out" },
            { name: "dataOut", type: "string", label: "data out" },
        ],
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
            try {
                const inputs = await context.fetchInputs(nodeId);

                const oldValue = context.getAllControls(nodeId).val as string;
                const update = (inputs.dataIn || [])[0] || oldValue;

                // Update graph if necessary
                if (update !== oldValue) {
                    await context.onControlChange(nodeId, "val", update);
                }

                return "triggerOut";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
        async dataFlow(nodeId, context) {
            return {
                dataOut: context.getAllControls(nodeId).val as string,
            };
        },
    }
);

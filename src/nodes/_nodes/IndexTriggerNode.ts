import { makeNode } from "./_Base";

const doc = [
    "Triggers one of the outputs based on the index value.",
    "The 'batch number' control is used together with the 'fallthrough'",
    "output to chain together multiple IndexTrigger nodes and handle",
    "index values greater than 9. In other words, to handle an index range of",
    "0-19 you would set the 'batch number' control to 1 on the second",
    "IndexTrigger node in the chain.",
]
    .join(" ")
    .trim();

export const IndexTriggerNode = makeNode(
    {
        nodeName: "IndexTriggerNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [330, 680],
        doc,
    },
    {
        inputs: [
            //
            { name: "triggerIn", type: "trigger", label: "trigger" },
            { name: "index", type: "string", label: "index" },
        ],
        outputs: [
            { name: "out0", type: "trigger", label: "out 0" },
            { name: "out1", type: "trigger", label: "out 1" },
            { name: "out2", type: "trigger", label: "out 2" },
            { name: "out3", type: "trigger", label: "out 3" },
            { name: "out4", type: "trigger", label: "out 4" },
            { name: "out5", type: "trigger", label: "out 5" },
            { name: "out6", type: "trigger", label: "out 6" },
            { name: "out7", type: "trigger", label: "out 7" },
            { name: "out8", type: "trigger", label: "out 8" },
            { name: "out9", type: "trigger", label: "out 9" },
            { name: "fallthrough", type: "trigger", label: "fallthrough" },
        ],

        controlsOverride: {
            batch_number: "batchNumber",
        },
        controls: [
            {
                name: "batchNumber",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "batch number",
                        min: 0,
                    },
                },
            },
        ],
    },
    {
        async controlFlow(nodeId, context) {
            try {
                const inputs = await context.fetchInputs(nodeId);
                const controls = context.getControlsWithOverride(
                    nodeId,
                    inputs
                );

                const index = parseInt((inputs.index ?? [])[0] ?? "0");
                const batchNumber = controls.batchNumber as number;

                const delta = 10 * batchNumber;
                const targetIndex = index - delta;

                if (targetIndex < 0) {
                    throw new Error("IndexTriggerNode: Index lower than 0!");
                }

                if (targetIndex <= 9) {
                    return `out${targetIndex}`;
                }

                return "fallthrough";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);

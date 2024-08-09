import { makeNode } from "./_Base";

const doc = [
    "Checks if the input text contains the given text.",
    "If it does, the node will fire the 'pass' output.",
    "If it doesn't, the node will fire the 'fail' output.",
]
    .join(" ")
    .trim();

export const DoesTextContainNode = makeNode(
    {
        nodeName: "DoesTextContainNode",
        nodeIcon: "CodeOutlined",
        dimensions: [580, 620],
        doc,
    },
    {
        inputs: [
            //
            { name: "triggerIn", type: "trigger", label: "trigger in" },
            { name: "dataIn", type: "string", label: "data in" },
        ],
        outputs: [
            { name: "pass", type: "trigger", label: "pass" },
            { name: "fail", type: "trigger", label: "fail" },
        ],
        controlsOverride: {
            text: "text",
        },
        controls: [
            {
                name: "text",
                control: {
                    type: "text",
                    defaultValue: "TEST",
                    config: {
                        large: true,
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

                const data = (inputs.dataIn || [])[0] || "";

                return data.includes(controls.text as string) ? "pass" : "fail";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);

import { makeNode } from "./_Base";

const doc = [
    //
    "Checks if the input string is less than or equal to",
    "the specified maximum length.",
]
    .join(" ")
    .trim();

export const TextIsMaxLengthNode = makeNode(
    {
        nodeName: "TextIsMaxLengthNode",
        nodeIcon: "CalculatorOutlined",
        dimensions: [330, 290],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "triggerIn",
                type: "trigger",
                label: "trigger in",
            },
            {
                name: "text",
                type: "string",
                label: "text (string)",
            },
        ],
        outputs: [
            //
            {
                name: "yes",
                type: "trigger",
                label: "yes",
            },
            {
                name: "no",
                type: "trigger",
                label: "no",
            },
        ],
        controls: [
            {
                name: "maxLength",
                control: {
                    type: "number",
                    defaultValue: 100,
                    config: {
                        label: "max length",
                        min: 1,
                    },
                },
            },
        ],
    },
    {
        async controlFlow(nodeId, context) {
            try {
                const inputs = await context.fetchInputs(nodeId);
                const controls = context.getAllControls(nodeId);

                const text: string = (inputs.text || [])[0] || "";
                const maxLength = (controls.maxLength as number) || 100;

                return text.length <= maxLength ? "yes" : "no";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);

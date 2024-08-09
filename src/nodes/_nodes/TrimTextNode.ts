import { makeNode } from "./_Base";

const doc = [
    //
    "Trims whitespaces surrounding the input text.",
    "The 'sides' control allows you to choose which sides to trim.",
]
    .join(" ")
    .trim();

export const TrimTextNode = makeNode(
    {
        nodeName: "TrimTextNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [350, 210],
        doc,
    },
    {
        inputs: [
            {
                name: "text",
                type: "string",
                label: "text",
            },
        ],
        outputs: [
            {
                name: "result",
                type: "string",
                label: "text (trimmed)",
            },
        ],

        controlsOverride: {
            sides: "sides",
        },
        controls: [
            {
                name: "sides",
                control: {
                    type: "select",
                    defaultValue: "both",
                    config: {
                        label: "sides",
                        values: [
                            { label: "both", value: "both" },
                            { label: "left", value: "left" },
                            { label: "right", value: "right" },
                        ],
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getControlsWithOverride(nodeId, inputs);

            const text: string = (inputs.text || [])[0] || "";

            switch (controls.sides) {
                case "both":
                    return { result: text.trim() };
                case "left":
                    return { result: text.trimStart() };
                case "right":
                    return { result: text.trimEnd() };
                default:
                    return { result: text.trim() };
            }
        },
    }
);

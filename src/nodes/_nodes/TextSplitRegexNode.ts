import { makeNode } from "./_Base";

const doc = [
    //
    "Splits a string using a regular expression.",
]
    .join(" ")
    .trim();

export const TextSplitRegexNode = makeNode(
    {
        nodeName: "TextSplitRegexNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [330, 220],
        doc,
    },
    {
        inputs: [
            //
            { name: "in", type: "string", label: "text" },
        ],
        outputs: [
            //
            { name: "result", type: "stringArray", label: "result (array)" },
        ],

        controlsOverride: {
            regex: "regex",
        },
        controls: [
            {
                name: "regex",
                control: {
                    type: "text",
                    defaultValue: "\\s+",
                    config: {
                        label: "regex",
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getControlsWithOverride(nodeId, inputs);

            const text: string = (inputs.in || [])[0] || "";
            const regex = new RegExp(controls.regex as string);

            return {
                result: text.split(regex),
            };
        },
    }
);

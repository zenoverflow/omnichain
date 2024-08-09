import { makeNode } from "./_Base";

const doc = [
    //
    "Splits a string using a separator.",
]
    .join(" ")
    .trim();

export const TextSplitNode = makeNode(
    {
        nodeName: "TextSplitNode",
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
            separator: "separator",
        },
        controls: [
            {
                name: "separator",
                control: {
                    type: "text",
                    defaultValue: "\\n",
                    config: {
                        label: "separator",
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
            let separator = (controls.separator as string) || "";

            // Characters in the separator are escaped
            // So convert things like \n to actual newlines
            separator = separator.replace(/\\n/g, "\n").replace(/\\t/g, "\t");

            return {
                result: text.split(separator),
            };
        },
    }
);

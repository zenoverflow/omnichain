import { makeNode } from "./_Base";

const doc = [
    //
    "Extract pieces from text strings using a regular expression.",
]
    .join(" ")
    .trim();

export const RegexExtractorNode = makeNode(
    {
        nodeName: "RegexExtractorNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [580, 475],
        doc,
    },
    {
        inputs: [
            //
            { name: "text", type: "string", label: "text" },
        ],
        outputs: [
            //
            { name: "results", type: "stringArray", label: "results (array)" },
        ],
        controls: [
            {
                name: "regex",
                control: {
                    type: "text",
                    defaultValue: ".*(target).*",
                    config: {
                        label: "regex",
                        large: true,
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getAllControls(nodeId);

            const text: string = (inputs.text || [])[0] || "";
            const regex = new RegExp(controls.regex as string);

            const pieces = text.match(regex) || [];

            return {
                results: pieces.slice(1),
            };
        },
    }
);

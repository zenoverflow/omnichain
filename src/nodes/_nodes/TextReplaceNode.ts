import { makeNode } from "./_Base";

const doc = [
    //
    "Replace a piece of text in another text.",
    "The 'target' is the text to be replaced, and the 'replacement'",
    "is the text to replace it with. The 'startIndex' is the index",
    "to start the replacement, and the 'limit' is the maximum number",
    "of replacements to perform in total. To disable the limit, set it to 0.",
]
    .join(" ")
    .trim();

export const TextReplaceNode = makeNode(
    {
        nodeName: "TextReplaceNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [350, 300],
        doc,
    },
    {
        inputs: [
            //
            { name: "text", type: "string", label: "text" },
            { name: "target", type: "string", label: "target" },
            { name: "replacement", type: "string", label: "replacement" },
        ],
        outputs: [
            //
            { name: "result", type: "string", label: "result" },
        ],
        controls: [
            {
                name: "startIndex",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "start at index",
                        min: 0,
                    },
                },
            },
            {
                name: "limit",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "limit",
                        min: 0,
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getAllControls(nodeId);

            const startIndex = controls.startIndex as number;
            const limit = controls.limit as number;

            const text: string = (inputs.text || [])[0] ?? "";
            const target: string = (inputs.target || [])[0] ?? "";
            const replacement: string = (inputs.replacement || [])[0] ?? "";

            let currentIndex = -1;
            let replacementsPerformed = 0;

            return {
                result: text.replaceAll(target, (match: string) => {
                    currentIndex += 1;

                    if (
                        (startIndex !== 0 && currentIndex < startIndex) ||
                        (limit !== 0 && replacementsPerformed >= limit)
                    ) {
                        return match;
                    }

                    replacementsPerformed += 1;
                    return replacement;
                }),
            };
        },
    }
);

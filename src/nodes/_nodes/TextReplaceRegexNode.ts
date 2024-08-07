import { makeNode } from "./_Base";

const doc = [
    //
    "Replace a piece of text in another text.",
    "The 'regex' is the regex to find the target, and the 'replacement'",
    "is the text to replace it with. The 'startIndex' is the index",
    "to start the replacement, and the 'limit' is the maximum number",
    "of replacements to perform in total. To disable the limit, set it to 0.",
]
    .join(" ")
    .trim();

export const TextReplaceRegexNode = makeNode(
    {
        nodeName: "TextReplaceRegexNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [350, 350],
        doc,
    },
    {
        inputs: [
            //
            { name: "text", type: "string", label: "text" },
            { name: "regex", type: "string", label: "regex" },
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
            {
                name: "caseInsensitive",
                control: {
                    type: "select",
                    defaultValue: "false",
                    config: {
                        label: "case insensitive",
                        values: [
                            { value: "true", label: "true" },
                            { value: "false", label: "false" },
                        ],
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

            const caseInsensitive = controls.caseInsensitive === "true";

            const text: string = (inputs.text || [])[0] ?? "";
            const regex: string = (inputs.regex || [])[0] ?? "";
            const replacement: string = (inputs.replacement || [])[0] ?? "";

            let regexFlags = "g";
            if (caseInsensitive) {
                regexFlags += "i";
            }

            const regexCompiled = new RegExp(regex, regexFlags);

            let currentIndex = -1;
            let replacementsPerformed = 0;

            return {
                result: text.replaceAll(regexCompiled, (match: string) => {
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

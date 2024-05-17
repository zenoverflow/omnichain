import { makeNode } from "./_Base";

const doc = [
    "Joins an array of text strings into a single text string.",
    "Can accept both an array of strings and two single strings.",
    "If both are provided, the single strings will be appended to the array.",
    "The 'separator' control specifies the separator used to join the pieces of text.",
]
    .join(" ")
    .trim();

export const TextJoinNode = makeNode(
    {
        nodeName: "TextJoinNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [300, 250],
        doc,
    },
    {
        inputs: [
            //
            { name: "textArr", type: "stringArray", label: "text (array)" },
            { name: "textSingle", type: "string", label: "text (single)" },
            { name: "textSingle2", type: "string", label: "text (single) 2" },
        ],
        outputs: [{ name: "result", type: "string", label: "result" }],
        controls: [
            {
                name: "separator",
                control: {
                    type: "text",
                    defaultValue: "\n",
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
            const controls = context.getAllControls(nodeId);

            let separator = (controls.separator as string) || "";

            // Characters in the separator are escaped
            // So convert things like \n to actual newlines
            separator = separator.replace(/\\n/g, "\n").replace(/\\t/g, "\t");

            const pieces: string[] = [...((inputs.textArr || [])[0] || [])];
            const single = (inputs.textSingle || [])[0];
            const single2 = (inputs.textSingle2 || [])[0];

            if (single) pieces.push(single);
            if (single2) pieces.push(single2);

            return {
                result: pieces.join(separator),
            };
        },
    }
);

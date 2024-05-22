import { makeNode } from "./_Base";

const doc = [
    //
    "Limit an array of strings via maximum character length.",
    "The node will remove strings from the start of the array",
    "until the total text length of all strings is less than or",
    "equal to the specified maximum length.",
]
    .join(" ")
    .trim();

export const LimitStringArrayNode = makeNode(
    {
        nodeName: "LimitStringArrayNode",
        nodeIcon: "CalculatorOutlined",
        dimensions: [330, 180],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "stringsIn",
                type: "stringArray",
                label: "strings (array)",
            },
        ],
        outputs: [
            //
            {
                name: "stringsOut",
                type: "stringArray",
                label: "strings (array)",
            },
        ],
        controls: [
            {
                name: "maxLength",
                control: {
                    type: "number",
                    defaultValue: 100,
                    config: {
                        label: "max chars",
                        min: 1,
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getAllControls(nodeId);

            const stringsIn: string[] = (inputs.stringsIn || [])[0] || [];
            const maxLength = controls.maxLength as number;

            const stringsOut: string[] = [];
            let total = 0;

            // Reverse the array to loop from newest to oldest
            for (const str of [...stringsIn].reverse()) {
                if (total + str.length > maxLength) {
                    break;
                }

                // Add to the front of the array so that
                // the order in the result goes from oldest to newest
                stringsOut.unshift(str);

                total += str.length;
            }

            return { stringsOut };
        },
    }
);

import { makeNode } from "./_Base";

const doc = [
    //
    "Make an array from strings, or append strings to an",
    "existing array. This node is useful for collecting strings.",
    "If no inputs are connected, the node will output an empty array.",
]
    .join(" ")
    .trim();

export const ArrayFromStringNode = makeNode(
    {
        nodeName: "ArrayFromStringNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [300, 210],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "sourceArr",
                type: "stringArray",
                label: "strings (array)",
            },
            {
                name: "sourceStr1",
                type: "string",
                label: "string1 (single)",
            },
            {
                name: "sourceStr2",
                type: "string",
                label: "string2 (single)",
            },
        ],
        outputs: [
            //
            {
                name: "outArr",
                type: "stringArray",
                label: "result (array)",
            },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);

            const sourceArr = (inputs.sourceArr || [])[0] || [];
            const sourceStr1 = (inputs.sourceStr1 || [])[0];
            const sourceStr2 = (inputs.sourceStr2 || [])[0];

            const result = [...sourceArr];

            if (sourceStr1) result.push(sourceStr1);
            if (sourceStr2) result.push(sourceStr2);

            return {
                outArr: result,
            };
        },
    }
);

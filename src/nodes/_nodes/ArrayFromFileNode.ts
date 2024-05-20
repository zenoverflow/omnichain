import { makeNode } from "./_Base";

const doc = [
    //
    "Make an array from files, or append files to an",
    "existing array. This node is useful for collecting files.",
    "If no inputs are connected, the node will output an empty array.",
]
    .join(" ")
    .trim();

export const ArrayFromFileNode = makeNode(
    {
        nodeName: "ArrayFromFileNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [300, 210],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "sourceArr",
                type: "fileArray",
                label: "files (array)",
            },
            {
                name: "sourceFile1",
                type: "file",
                label: "file1 (single)",
            },
            {
                name: "sourceFile2",
                type: "file",
                label: "file2 (single)",
            },
        ],
        outputs: [
            //
            {
                name: "outArr",
                type: "fileArray",
                label: "result (array)",
            },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);

            const sourceArr = (inputs.sourceArr || [])[0] || [];
            const sourceFile1 = (inputs.sourceFile1 || [])[0];
            const sourceFile2 = (inputs.sourceFile2 || [])[0];

            const result = [...sourceArr];

            if (sourceFile1) result.push(sourceFile1);
            if (sourceFile2) result.push(sourceFile2);

            return {
                outArr: result,
            };
        },
    }
);

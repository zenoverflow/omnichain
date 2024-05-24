import { makeNode } from "./_Base";

const doc = [
    //
    "Takes a file array and returns a slice of it,",
    "based on the start and end controls.",
]
    .join(" ")
    .trim();

export const SliceFileArrayNode = makeNode(
    {
        nodeName: "SliceFileArrayNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [330, 240],
        doc,
    },
    {
        inputs: [
            //
            { name: "array", type: "fileArray", label: "array" },
        ],
        outputs: [
            //
            { name: "result", type: "fileArray", label: "result" },
        ],
        controls: [
            {
                name: "start",
                control: {
                    type: "number",
                    defaultValue: null,
                    config: {
                        label: "index",
                    },
                },
            },
            {
                name: "end",
                control: {
                    type: "number",
                    defaultValue: null,
                    config: {
                        label: "index",
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getAllControls(nodeId);

            const array: string[] = (inputs["array"] || [])[0] ?? [];

            const start = (controls.start as number | null) || undefined;
            const end = (controls.end as number | null) || undefined;

            const result = array.slice(start, end);

            return { result };
        },
    }
);

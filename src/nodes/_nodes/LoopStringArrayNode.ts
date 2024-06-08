import { makeNode } from "./_Base";

const doc = [
    //
    "Loop over an array of strings.",
    "Expects an array of strings as input.",
    "While there are items left, the 'next' trigger will fire.",
    "When all items have been processed, the 'done' trigger will fire.",
    "The current item is available as a data output.",
    "Will fetch its inputs only on the first run.",
]
    .join(" ")
    .trim();

// Map of (graphId-nodeId-instanceId) to store loop data
type _LoopItem = {
    index: number;
    data: any;
};
const loopData: { [x: string]: _LoopItem } = {};

export const LoopStringArrayNode = makeNode(
    {
        nodeName: "LoopStringArrayNode",
        nodeIcon: "OrderedListOutlined",
        dimensions: [300, 300],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "run",
                type: "trigger",
                label: "run",
            },
            {
                name: "sourceArr",
                type: "stringArray",
                label: "strings (array)",
            },
        ],
        outputs: [
            //
            {
                name: "next",
                type: "trigger",
                label: "next",
            },
            {
                name: "done",
                type: "trigger",
                label: "done",
            },
            {
                name: "item",
                type: "string",
                label: "item (string)",
            },
        ],
        controls: [],
    },
    {
        async controlFlow(nodeId, context, _trigger) {
            try {
                const loopId =
                    context.graphId + "-" + nodeId + "-" + context.instanceId;

                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (!loopData[loopId]) {
                    loopData[loopId] = {
                        index: -1,
                        data: await context.fetchInputs(nodeId),
                    };
                }

                const inputs = loopData[loopId].data;
                const sourceArr: string[] = (inputs.sourceArr || [])[0] || [];

                if (loopData[loopId].index === sourceArr.length - 1) {
                    // clear loop data
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete loopData[loopId];
                    return "done";
                }

                loopData[loopId].index += 1;

                return "next";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
        async dataFlow(nodeId, context) {
            const loopId =
                context.graphId + "-" + nodeId + "-" + context.instanceId;

            const inputs = loopData[loopId].data;
            const sourceArr: string[] = (inputs.sourceArr || [])[0] || [];

            return {
                item: sourceArr[loopData[loopId].index] || "",
            };
        },
    }
);

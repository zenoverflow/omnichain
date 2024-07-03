import { makeNode } from "./_Base";

const doc = [
    "Used to allow voting on a decision.",
    "Works similarly to the loop nodes, but with a fixed number of cycles.",
    "The 'cycles' control should be set to the number of votes needed.",
    "It's best to use an odd number of cycles to avoid ties.",
    "Votes are saved on each cycle until the max number of cycles is reached.",
    "If the 'yes' votes are greater than the 'no' votes, the 'on decide yes' trigger will fire.",
    "If the 'no' votes are greater than the 'yes' votes, the 'on decide no' trigger will fire.",
    "If there are more cycles left, the 'on cycle' trigger will fire.",
    "Note that votes will only be cleared from memory once the max number of cycles is reached.",
]
    .join(" ")
    .trim();

// Map of (graphId-nodeId-instanceId) to store loop data
type _LoopItem = {
    index: number;
    votesYes: number;
    votesNo: number;
};
const loopData: { [x: string]: _LoopItem } = {};

export const ArbiterNode = makeNode(
    {
        nodeName: "ArbiterNode",
        nodeIcon: "AuditOutlined",
        dimensions: [330, 330],
        doc,
    },
    {
        inputs: [
            { name: "triggerVoteYes", type: "trigger", label: "vote yes" },
            { name: "triggerVoteNo", type: "trigger", label: "vote no" },
        ],
        outputs: [
            {
                name: "triggerCycle",
                type: "trigger",
                label: "on cycle",
            },
            {
                name: "triggerDecideYes",
                type: "trigger",
                label: "on decide yes",
            },
            {
                name: "triggerDecideNo",
                type: "trigger",
                label: "on decide no",
            },
        ],
        controls: [
            {
                name: "cycles",
                control: {
                    type: "number",
                    defaultValue: 3,
                    config: {
                        min: 1,
                    },
                },
            },
        ],
    },
    {
        async controlFlow(nodeId, context, trigger) {
            let loopId = "";
            try {
                loopId =
                    context.graphId + "-" + nodeId + "-" + context.instanceId;

                const maxCycles = context.getAllControls(nodeId).cycles;

                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (!loopData[loopId]) {
                    loopData[loopId] = {
                        index: 0,
                        votesYes: 0,
                        votesNo: 0,
                    };
                }

                loopData[loopId].index += 1;
                if (trigger === "triggerVoteYes") {
                    loopData[loopId].votesYes += 1;
                } else if (trigger === "triggerVoteNo") {
                    loopData[loopId].votesNo += 1;
                }

                if (loopData[loopId].index === maxCycles) {
                    const result =
                        loopData[loopId].votesYes > loopData[loopId].votesNo
                            ? "triggerDecideYes"
                            : "triggerDecideNo";
                    // clear loop data
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete loopData[loopId];
                    return result;
                }

                return "triggerCycle";
            } catch (error) {
                try {
                    // clear loop data
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    if (loopId) delete loopData[loopId];
                } catch (error) {
                    console.error("--ERROR--\n", error);
                }
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);

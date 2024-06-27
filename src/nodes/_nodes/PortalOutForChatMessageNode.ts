import { makeNode } from "./_Base";

const doc = [
    //
    "Allows teleporting a chat message value from the corresponding",
    "portal node. Very handy for dataflow reuse.",
    "The portal ID must match the ID of the",
    "source portal node. You can have multiple PortalOut nodes",
    "getting data from the same PortalIn node.",
]
    .join(" ")
    .trim();

export const PortalOutForChatMessageNode = makeNode(
    {
        nodeName: "PortalOutForChatMessageNode",
        nodeIcon: "LinkOutlined",
        dimensions: [350, 150],
        doc,
    },
    {
        inputs: [],
        outputs: [
            {
                name: "out",
                type: "chatMessage",
                label: "out (message)",
            },
        ],
        controls: [
            {
                name: "portal",
                control: {
                    type: "text",
                    defaultValue: "ChatMessagePortal",
                    config: {
                        label: "Portal ID",
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const ownPortal = context.getAllControls(nodeId).portal;
            const graph = context.getGraph();
            const sourceNodeId = graph.nodes.find(
                (n) =>
                    n.nodeType === "PortalInForChatMessageNode" &&
                    context.getAllControls(n.nodeId).portal === ownPortal
            )?.nodeId;

            if (!sourceNodeId) {
                throw new Error(
                    `No matching portal node found for portal ID '${ownPortal}'`
                );
            }

            const sourceInputs = await context.fetchInputs(sourceNodeId);

            const source = (sourceInputs.source || [])[0];

            if (!source) {
                throw new Error(
                    `No value found in the source portal '${ownPortal}'`
                );
            }

            return {
                out: source,
            };
        },
    }
);

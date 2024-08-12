import { makeNode } from "./_Base";

const doc = [
    //
    "Allows teleporting a file value to the corresponding",
    "portal node. Very handy for dataflow reuse.",
    "The portal ID must match the ID of the",
    "target portal node. Make sure you don't create PortalIn nodes",
    "with the same portal ID in the same graph, because only the",
    "first one will be found by the target.",
]
    .join(" ")
    .trim();

export const PortalInForFileNode = makeNode(
    {
        nodeName: "PortalInForFileNode",
        nodeIcon: "LinkOutlined",
        dimensions: [450, 150],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "source",
                type: "file",
                label: "input (file)",
            },
        ],
        outputs: [],
        controls: [
            {
                name: "portal",
                control: {
                    type: "text",
                    defaultValue: "FilePortal",
                    config: {
                        label: "Portal ID",
                    },
                },
            },
        ],
    }
);

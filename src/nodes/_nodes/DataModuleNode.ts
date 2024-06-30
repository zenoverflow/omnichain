import { makeNode } from "./_Base";

const doc = [
    //
    "Part of the modularization functionality.",
    "A dataflow module is defined by the DataModule node",
    "and the DataModuleIO node. The DataModule node pulls data from",
    "the DataModuleIO node and its inputs are used for the DataModuleIO node's outputs.",
    "To make the two nodes work in tandem, you must set the same",
    "unique ID on both of them. Make sure you have only one DataModuleIO",
    "node for any given module ID. The DataModule can be used as many",
    "times as you want with the same ID.",
]
    .join(" ")
    .trim();

export const DataModuleNode = makeNode(
    {
        nodeName: "DataModuleNode",
        nodeIcon: "ApartmentOutlined",
        dimensions: [430, 630],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "string",
                type: "string",
                label: "string (single)",
            },
            {
                name: "stringArray",
                type: "stringArray",
                label: "strings (array)",
            },
            {
                name: "chatMessage",
                type: "chatMessage",
                label: "chat message",
            },
            {
                name: "chatMessageArray",
                type: "chatMessageArray",
                label: "chat messages (array)",
            },
            {
                name: "file",
                type: "file",
                label: "file",
            },
            {
                name: "fileArray",
                type: "fileArray",
                label: "files (array)",
            },
            {
                name: "slot",
                type: "slot",
                label: "slot",
            },
        ],
        outputs: [
            //
            {
                name: "string",
                type: "string",
                label: "string (single)",
            },
            {
                name: "stringArray",
                type: "stringArray",
                label: "strings (array)",
            },
            {
                name: "chatMessage",
                type: "chatMessage",
                label: "chat message",
            },
            {
                name: "chatMessageArray",
                type: "chatMessageArray",
                label: "chat messages (array)",
            },
            {
                name: "file",
                type: "file",
                label: "file",
            },
            {
                name: "fileArray",
                type: "fileArray",
                label: "files (array)",
            },
            {
                name: "slot",
                type: "slot",
                label: "slot",
            },
        ],
        controls: [
            {
                name: "module",
                control: {
                    type: "text",
                    defaultValue: "MyDataModule",
                    config: {
                        label: "Module ID",
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const ownModule = context.getAllControls(nodeId).module;
            const graph = context.getGraph();
            const moduleIONodeId = graph.nodes.find(
                (n) =>
                    n.nodeType === "DataModuleIONode" &&
                    context.getAllControls(n.nodeId).module === ownModule
            )?.nodeId;

            if (!moduleIONodeId) {
                throw new Error(
                    `No matching module node found for module ID '${ownModule}'`
                );
            }

            await context.updateControl(moduleIONodeId, "caller", nodeId);

            return Object.fromEntries(
                Object.entries(await context.fetchInputs(moduleIONodeId)).map(
                    ([key, value]) => [key, value?.[0]]
                )
            );
        },
    }
);

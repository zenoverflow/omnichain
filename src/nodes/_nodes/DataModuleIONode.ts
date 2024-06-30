import { makeNode } from "./_Base";

const doc = [
    //
    "Part of the modularization functionality.",
    "A dataflow module is defined by the DataModule node",
    "and the DataModuleIO node. The DataModule node pulls data from",
    "the DataModuleIO node and its inputs are used for the DataModuleIO",
    "node's outputs. To make the two nodes work in tandem, you must set the",
    "same unique ID on both of them. Make sure you have only one DataModuleIO",
    "node for any given module ID. The DataModule can be used as many",
    "times as you want with the same ID. Note that the 'caller' ID on",
    "the DataModuleIO node is automatically set to the ID of the",
    "DataModule node that is calling it. This allows for multiple",
    "DataModule nodes to use the same DataModuleIO node.",
]
    .join(" ")
    .trim();

export const DataModuleIONode = makeNode(
    {
        nodeName: "DataModuleIONode",
        nodeIcon: "ApartmentOutlined",
        dimensions: [430, 680],
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
            {
                name: "caller",
                control: {
                    type: "text",
                    defaultValue: "",
                    readOnly: true,
                    config: {
                        label: "Caller ID",
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const controls = context.getAllControls(nodeId);

            const ownModule = controls.module as string;
            const caller = controls.caller as string;

            const graph = context.getGraph();
            const moduleNodeId = graph.nodes.find(
                (n) =>
                    n.nodeType === "DataModuleNode" &&
                    n.nodeId === caller &&
                    context.getAllControls(n.nodeId).module === ownModule
            )?.nodeId;

            if (!moduleNodeId) {
                throw new Error(
                    `No matching module output node found for module ID '${ownModule}'`
                );
            }

            return Object.fromEntries(
                Object.entries(await context.fetchInputs(moduleNodeId)).map(
                    ([key, value]) => [key, value?.[0]]
                )
            );
        },
    }
);

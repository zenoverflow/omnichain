import { makeNode } from "./_Base";

const doc = [
    //
    "Part of the modularization functionality.",
    "A controlflow module is defined by the ControlModule node",
    "and the ControlModuleIO node. The ControlModule forwards a trigger to",
    "the ControlModuleIO node and its inputs are used for the DataModuleIO node's outputs.",
    "To make the two nodes work in tandem, you must set the same",
    "unique ID on both of them. Make sure you have only one ControlModuleIO",
    "node for any given module ID. The ControlModule can be used as many",
    "times as you want with the same ID.",
]
    .join(" ")
    .trim();

export const ControlModuleNode = makeNode(
    {
        nodeName: "ControlModuleNode",
        nodeIcon: "ApartmentOutlined",
        dimensions: [430, 710],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "triggerIn",
                type: "trigger",
                label: "trigger in",
            },
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
                name: "triggerOut",
                type: "trigger",
                label: "trigger out",
            },
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
                    defaultValue: "MyControlModule",
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
                    n.nodeType === "ControlModuleIONode" &&
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

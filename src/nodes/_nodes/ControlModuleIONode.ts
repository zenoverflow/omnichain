import { makeNode } from "./_Base";

const doc = [
    //
    "Part of the modularization functionality.",
    "A dataflow module is defined by the ControlModule node",
    "and the ControlModuleIO node. The ControlModule node forwards a trigger to",
    "the ControlModuleIO node and its inputs are used for the ControlModuleIO",
    "node's outputs. To make the two nodes work in tandem, you must set the",
    "same unique ID on both of them. Make sure you have only one ControlModuleIO",
    "node for any given module ID. The ControlModule can be used as many",
    "times as you want with the same ID. Note that the 'caller' ID on",
    "the ControlModuleIO node is automatically set to the ID of the",
    "ControlModule node that is calling it. This allows for multiple",
    "ControlModule nodes to use the same ControlModuleIO node.",
]
    .join(" ")
    .trim();

export const ControlModuleIONode = makeNode(
    {
        nodeName: "ControlModuleIONode",
        nodeIcon: "ApartmentOutlined",
        dimensions: [530, 760],
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
                    n.nodeType === "ControlModuleNode" &&
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

import { makeNode } from "./_Base";
// import { ClassicPreset } from "rete";
// import { CodeOutlined } from "@ant-design/icons";

// import { NodeContextObj } from "../context";
// import { TriggerSocket } from "../_sockets/TriggerSocket";
// import { StringSocket } from "../_sockets/StringSocket";
// import { TextControl } from "../_controls/TextControl";

export const LogOutputNode = makeNode(
    {
        nodeName: "LogOutputNode",
        nodeIcon: "CodeOutlined",
        dimensions: [580, 480],
    },
    {
        inputs: [
            { name: "trigger", type: "trigger" },
            { name: "data", type: "string" },
        ],
        outputs: [],
        controls: [
            {
                name: "val",
                control: {
                    type: "text",
                    defaultValue: "",
                    config: { large: true },
                },
            },
        ],
    },
    {
        controlFlow: {
            inputs: ["trigger"],
            outputs: [],
            async logic(node, context, controls, fetchInputs, forward) {
                const inputs = (await fetchInputs()) as {
                    data?: any[];
                };

                const valControl = node.controls.val;

                valControl.value =
                    (inputs?.data || [""])[0] || valControl.value;

                // Update graph
                node.context.onControlChange(
                    context.graphId,
                    node.id,
                    "val",
                    valControl.value
                );
            },
        },
        dataFlow: {
            inputs: ["data"],
            outputs: [],
            async logic(node, context, controls, fetchInputs) {
                return {};
            },
        },
    }
);

// export class _LogOutputNode extends ClassicPreset.Node<
//     { trigger: TriggerSocket; data: StringSocket },
//     never,
//     { val: TextControl }
// > {
//     public static icon = CodeOutlined;
//     width = 580;
//     height = 480;

//     constructor(
//         private context: NodeContextObj,
//         id?: string,
//         controls?: Record<string, any>
//     ) {
//         super(_LogOutputNode.name);
//         const self = this;
//         self.id = id ?? self.id;
//         //
//         //
//         this.addControl(
//             "val",
//             new TextControl(
//                 self.id,
//                 "val",
//                 "",
//                 {
//                     // initial: controls?.val ?? "",
//                     large: true,
//                 },
//                 context
//             )
//         );
//         //
//         //
//         this.addInput(
//             "trigger",
//             new ClassicPreset.Input(new TriggerSocket(), "trigger-in")
//         );
//         this.addInput(
//             "data",
//             new ClassicPreset.Input(new StringSocket(), "data")
//         );
//         //
//         //
//         self.context.control.add(self, {
//             inputs: () => ["trigger"],
//             outputs: () => [],
//             async execute(_: "trigger") {
//                 if (!self.context.getIsActive()) return;

//                 self.context.onFlowNode(self.id);

//                 const inputs = (await self.context.dataflow.fetchInputs(
//                     self.id
//                 )) as {
//                     data?: any[];
//                 };

//                 self.context.onFlowNode(self.id);

//                 const valControl = self.controls.val;

//                 valControl.value =
//                     (inputs?.data || [""])[0] || valControl.value;

//                 // Update graph
//                 self.context.onControlChange(
//                     self.context.graphId,
//                     self.id,
//                     "val",
//                     valControl.value
//                 );
//             },
//         });
//         self.context.dataflow.add(self, {
//             inputs: () => ["data"],
//             outputs: () => [],
//             data() {
//                 if (!self.context.getIsActive()) return {};

//                 self.context.onFlowNode(self.id);

//                 return {};
//             },
//         });
//     }
// }

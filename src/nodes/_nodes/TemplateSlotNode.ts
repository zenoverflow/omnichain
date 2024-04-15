import { makeNode } from "./_Base";
// import { ClassicPreset } from "rete";
// import { FileTextOutlined } from "@ant-design/icons";

// import { NodeContextObj } from "../context";
// import { StringSocket } from "../_sockets/StringSocket";
// import { TemplateSlotSocket } from "../_sockets/TemplateSlotSocket";
// import { TextControl } from "../_controls/TextControl";

export const TemplateSlotNode = makeNode(
    {
        nodeName: "TemplateSlotNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [580, 490],
    },
    {
        inputs: [{ name: "in", type: "string" }],
        outputs: [
            {
                name: "templateSlot",
                type: "templateSlot",
                label: "template slot",
                multi: true,
            },
        ],
        controls: [
            {
                name: "slotName",
                control: {
                    type: "text",
                    defaultValue: "slot",
                    config: {
                        label: "slot name",
                    },
                },
            },
            {
                name: "val",
                control: {
                    type: "text",
                    defaultValue: "",
                    config: {
                        large: true,
                    },
                },
            },
        ],
    },
    {
        dataFlow: {
            inputs: ["in"],
            outputs: ["templateSlot"],
            async logic(node, context, controls, fetchInputs) {
                if (!(controls["slotName"] as string).length) {
                    throw new Error("Missing slot name in TemplateSlot!");
                }

                const inputs = (await fetchInputs()) as {
                    in?: string[];
                };

                const valControl = node.controls.val;

                valControl.value = (inputs?.in || [""])[0] || valControl.value;

                // Update graph
                context.onControlChange(
                    context.graphId,
                    node.id,
                    "val",
                    valControl.value
                );

                return {
                    templateSlot: {
                        name: controls["slotName"],
                        value: valControl.value,
                    },
                };
            },
        },
    }
);

// export class _TemplateSlotNode extends ClassicPreset.Node<
//     { in: StringSocket },
//     { templateSlot: TemplateSlotSocket },
//     { slotName: TextControl; val: TextControl }
// > {
//     public static icon = FileTextOutlined;
//     width = 580;
//     height = 490;

//     constructor(
//         private context: NodeContextObj,
//         id?: string,
//         controls?: Record<string, any>
//     ) {
//         super(_TemplateSlotNode.name);
//         const self = this;
//         self.id = id ?? self.id;
//         //
//         //
//         this.addControl(
//             "slotName",
//             new TextControl(
//                 self.id,
//                 "slotName",
//                 {
//                     label: "slot name",
//                     initial: controls?.slotName ?? "",
//                 },
//                 context
//             )
//         );
//         this.addControl(
//             "val",
//             new TextControl(
//                 self.id,
//                 "val",
//                 {
//                     initial: controls?.val ?? "",
//                     large: true,
//                 },
//                 context
//             )
//         );
//         //
//         //
//         this.addInput("in", new ClassicPreset.Input(new StringSocket(), "in"));
//         this.addOutput(
//             "templateSlot",
//             new ClassicPreset.Output(
//                 new TemplateSlotSocket(),
//                 "template slot",
//                 true
//             )
//         );
//         //
//         //
//         // self.control.add(self, {
//         //     inputs: () => [],
//         //     outputs: () => [],
//         //     async execute(input, forward) {
//         //         const inputs = await dataflow.fetchInputs(self.id);
//         //         forward(0);
//         //     },
//         // });
//         self.context.dataflow.add(self, {
//             inputs: () => ["in"],
//             outputs: () => ["templateSlot"],
//             async data(fetchInputs) {
//                 if (!self.context.getIsActive()) return {};

//                 const noSlotNameError = () => {
//                     const e = new Error("Missing slot name in TemplateSlot!");
//                     self.context.onError(e);
//                     return e;
//                 };

//                 self.context.onFlowNode(self.id);

//                 if (!self.controls.slotName.value.length) {
//                     throw noSlotNameError();
//                 }

//                 const inputs = (await fetchInputs()) as {
//                     in?: string[];
//                 };

//                 self.context.onFlowNode(self.id);

//                 const valControl = self.controls.val;

//                 valControl.value = (inputs?.in || [""])[0] || valControl.value;

//                 // Update graph
//                 self.context.onControlChange(
//                     self.context.graphId,
//                     self.id,
//                     "val",
//                     valControl.value
//                 );

//                 return {
//                     templateSlot: {
//                         name: self.controls.slotName.value,
//                         value: valControl.value,
//                     },
//                 };
//             },
//         });
//     }
// }

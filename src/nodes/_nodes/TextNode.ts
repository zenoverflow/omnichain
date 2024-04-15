import { makeNode } from "./_Base";
// import { ClassicPreset } from "rete";
// import { FileTextOutlined } from "@ant-design/icons";

// import { NodeContextObj } from "../context";
// import { StringSocket } from "../_sockets/StringSocket";
// import { TextControl } from "../_controls/TextControl";

export const TextNode = makeNode(
    {
        nodeName: "TextNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [580, 450],
    },
    {
        inputs: [{ name: "in", type: "string" }],
        outputs: [{ name: "out", type: "string", multi: true }],
        controls: [
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
            outputs: ["out"],
            async logic(node, context, controls, fetchInputs) {
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

                return { out: valControl.value };
            },
        },
    }
);

// export class _TextNode extends ClassicPreset.Node<
//     { in: StringSocket },
//     { out: StringSocket },
//     { val: TextControl }
// > {
//     public static icon = FileTextOutlined;
//     width = 580;
//     height = 450;

//     constructor(
//         private context: NodeContextObj,
//         id?: string,
//         controls?: Record<string, any>
//     ) {
//         super(_TextNode.name);
//         const self = this;
//         self.id = id ?? self.id;
//         //
//         //
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
//         this.addInput(
//             "in",
//             new ClassicPreset.Input(new StringSocket(), "write")
//         );
//         this.addOutput(
//             "out",
//             new ClassicPreset.Output(new StringSocket(), "read", true)
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
//             outputs: () => ["out"],
//             async data(fetchInputs) {
//                 if (!self.context.getIsActive()) return {};

//                 self.context.onFlowNode(self.id);

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

//                 return { out: valControl.value };
//             },
//         });
//     }
// }

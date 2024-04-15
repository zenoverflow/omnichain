import { makeNode } from "./_Base";
// import { ClassicPreset } from "rete";
// import { FileTextOutlined } from "@ant-design/icons";
//
// import { NodeContextObj } from "../context";
// import { StringSocket } from "../_sockets/StringSocket";
// import { TemplateSlotSocket } from "../_sockets/TemplateSlotSocket";
// import { TextControl } from "../_controls/TextControl";

export const PromptBuilderNode = makeNode(
    {
        nodeName: "PromptBuilderNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [580, 450],
    },
    {
        inputs: [{ name: "parts", type: "templateSlot", multi: true }],
        outputs: [{ name: "prompt", type: "string", multi: true }],
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
        dataFlow: {
            inputs: ["parts"],
            outputs: ["prompt"],
            async logic(node, context, controls, fetchInputs) {
                const inputs = (await fetchInputs()) as {
                    parts?: {
                        name: string;
                        value: string;
                    }[];
                };

                let prompt = controls["val"] as string;

                for (const { name, value } of inputs.parts ?? []) {
                    prompt = prompt.replaceAll("{" + name + "}", value);
                }

                return { prompt };
            },
        },
    }
);

// export class _PromptBuilderNode extends ClassicPreset.Node<
//     { parts: TemplateSlotSocket },
//     { prompt: StringSocket },
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
//         super(_PromptBuilderNode.name);
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
//         this.addInput(
//             "parts",
//             new ClassicPreset.Input(new TemplateSlotSocket(), "parts", true)
//         );
//         this.addOutput(
//             "prompt",
//             new ClassicPreset.Output(new StringSocket(), "prompt", true)
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
//             inputs: () => ["parts"],
//             outputs: () => ["prompt"],
//             async data(fetchInputs) {
//                 if (!self.context.getIsActive()) return {};

//                 self.context.onFlowNode(self.id);

//                 const inputs = (await fetchInputs()) as {
//                     parts?: {
//                         name: string;
//                         value: string;
//                     }[];
//                 };

//                 self.context.onFlowNode(self.id);

//                 let prompt = self.controls.val.value;

//                 for (const { name, value } of inputs.parts ?? []) {
//                     prompt = prompt.replaceAll("{" + name + "}", value);
//                 }

//                 return { prompt };
//             },
//         });
//     }
// }

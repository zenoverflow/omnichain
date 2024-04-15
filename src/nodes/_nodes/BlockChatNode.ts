import { makeNode } from "./_Base";
// import { ClassicPreset } from "rete";
// import { PauseCircleOutlined } from "@ant-design/icons";

// import { NodeContextObj } from "../context";
// import { TriggerSocket } from "../_sockets/TriggerSocket";
// import { SelectControl } from "../_controls/SelectControl";
import { blockChat, unblockChat } from "../../state/chatBlock";

export const BlockChatNode = makeNode(
    {
        nodeName: "BlockChatNode",
        nodeIcon: "PauseCircleOutlined",
        dimensions: [300, 165],
    },
    {
        inputs: [{ name: "triggerIn", type: "trigger", label: "trigger-in" }],
        outputs: [{ name: "triggerOut", type: "trigger", label: "trigger-in" }],
        controls: [
            {
                name: "action",
                control: {
                    type: "select",
                    defaultValue: "block",
                    config: {
                        values: [
                            { value: "block", label: "Block" },
                            { value: "unblock", label: "Unblock" },
                        ],
                    },
                },
            },
        ],
    },
    {
        controlFlow: {
            inputs: ["triggerIn"],
            outputs: ["triggerOut"],
            async logic(node, context, controls, fetchInputs, forward) {
                const action = controls["value"] as "block" | "unblock";

                if (action === "block") {
                    blockChat();
                } else if (action === "unblock") {
                    unblockChat();
                }

                forward("triggerOut");
            },
        },
    }
);

// export class _BlockChatNode extends ClassicPreset.Node<
//     { triggerIn: TriggerSocket },
//     { triggerOut: TriggerSocket },
//     { action: SelectControl }
// > {
//     public static icon = PauseCircleOutlined;
//     width = 300;
//     height = 165;

//     constructor(
//         private context: NodeContextObj,
//         id?: string,
//         controls?: Record<string, any>
//     ) {
//         super(BlockChatNode.name);
//         const self = this;
//         self.id = id ?? self.id;
//         //
//         //
//         self.context.control.add(self, {
//             inputs: () => ["triggerIn"],
//             outputs: () => ["triggerOut"],
//             async execute(_: never, forward) {
//                 if (!self.context.getIsActive()) return;

//                 self.context.onFlowNode(self.id);

//                 const action = self.controls.action.value as
//                     | "block"
//                     | "unblock";

//                 if (action === "block") {
//                     blockChat();
//                 } else if (action === "unblock") {
//                     unblockChat();
//                 }

//                 forward("triggerOut");
//             },
//         });
//         self.context.dataflow.add(self, {
//             inputs: () => [],
//             outputs: () => [],
//             async data() {
//                 if (!self.context.getIsActive()) return {};

//                 // self.context.onFlowNode(self.id);

//                 return {};
//             },
//         });
//         //
//         //
//         self.addInput(
//             "triggerIn",
//             new ClassicPreset.Input(new TriggerSocket(), "trigger-in")
//         );
//         self.addOutput(
//             "triggerOut",
//             new ClassicPreset.Output(new TriggerSocket(), "trigger-out")
//         );
//         this.addControl(
//             "action",
//             new SelectControl(
//                 self.id,
//                 "action",
//                 "block",
//                 {
//                     values: [
//                         { value: "block", label: "Block" },
//                         { value: "unblock", label: "Unblock" },
//                     ],
//                     // initial: controls?.action ?? "block",
//                 },
//                 context
//             )
//         );
//     }
// }

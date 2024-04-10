import { ClassicPreset } from "rete";
import { PauseCircleOutlined } from "@ant-design/icons";

import { NodeContextObj } from "../context";
import { TriggerSocket } from "../_sockets/TriggerSocket";
import { SelectControl } from "../_controls/SelectControl";

import { blockChat, unblockChat } from "../../state/chatBlock";

export class BlockChatNode extends ClassicPreset.Node<
    { triggerIn: TriggerSocket },
    { triggerOut: TriggerSocket },
    { action: SelectControl }
> {
    public static icon = PauseCircleOutlined;
    width: number = 300;
    height: number = 165;

    constructor(
        private context: NodeContextObj,
        id: string,
        controls: Record<string, any> = {}
    ) {
        super(BlockChatNode.name);
        const self = this;
        self.id = id ?? self.id;
        //
        //
        self.context.control.add(self, {
            inputs: () => ["triggerIn"],
            outputs: () => ["triggerOut"],
            async execute(_: never, forward) {
                if (!self.context.getIsActive()) return;

                self.context.onFlowNode(self.id);

                const action: "block" | "unblock" = self.controls.action.value;

                if (action === "block") {
                    blockChat();
                } else if (action === "unblock") {
                    unblockChat();
                }

                forward("triggerOut");
            },
        });
        self.context.dataflow.add(self, {
            inputs: () => [],
            outputs: () => [],
            async data() {
                if (!self.context.getIsActive()) return {};

                // self.context.onFlowNode(self.id);

                return {};
            },
        });
        //
        //
        self.addInput(
            "triggerIn",
            new ClassicPreset.Input(new TriggerSocket(), "trigger-in")
        );
        self.addOutput(
            "triggerOut",
            new ClassicPreset.Output(new TriggerSocket(), "trigger-out")
        );
        this.addControl(
            "action",
            new SelectControl({
                values: [
                    { value: "block", label: "Block" },
                    { value: "unblock", label: "Unblock" },
                ],
                initial: controls.action ?? "block",
            })
        );
    }
}

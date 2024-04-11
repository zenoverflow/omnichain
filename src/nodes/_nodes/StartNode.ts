import { ClassicPreset } from "rete";
import { PlayCircleOutlined } from "@ant-design/icons";

import { NodeContextObj } from "../context";
import { TriggerSocket } from "../_sockets/TriggerSocket";

export class StartNode extends ClassicPreset.Node<
    { triggerIn: TriggerSocket },
    { triggerOut: TriggerSocket },
    never
> {
    public static icon = PlayCircleOutlined;
    width = 200;
    height = 120;

    constructor(
        private context: NodeContextObj,
        id?: string,
        controls?: Record<string, any>
    ) {
        super(StartNode.name);
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
    }
}

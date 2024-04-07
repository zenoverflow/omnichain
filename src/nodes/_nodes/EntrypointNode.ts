import { ClassicPreset } from "rete";
import { PlayCircleOutlined } from "@ant-design/icons";

import { NodeContextObj } from "../context";
import { TriggerSocket } from "../_sockets/TriggerSocket";

export class EntrypointNode extends ClassicPreset.Node<
    { triggerIn: TriggerSocket },
    { triggerOut: TriggerSocket },
    {}
> {
    public static icon = PlayCircleOutlined;
    width: number = 200;
    height: number = 120;

    constructor(
        private context: NodeContextObj,
        id: string | null = null,
        // @ts-ignore
        controls: Record<string, any> = {}
    ) {
        super(EntrypointNode.name);
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

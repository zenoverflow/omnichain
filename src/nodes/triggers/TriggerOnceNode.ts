import { ClassicPreset } from "rete";

import { TriggerSocket } from "../_sockets/TriggerSocket";

import { NodeContextObj } from "../context";

export class TriggerOnceNode extends ClassicPreset.Node<
    {},
    { trigger: TriggerSocket },
    {}
> {
    width: number = 200;
    height: number = 90;

    constructor(
        private context: NodeContextObj,
        id: string | null = null,
        // @ts-ignore
        controls: Record<string, any> = {}
    ) {
        super(TriggerOnceNode.name);
        const self = this;
        self.id = id ?? self.id;
        //
        //
        self.context.control.add(self, {
            inputs: () => [],
            outputs: () => ["trigger"],
            async execute(_: never, forward) {
                if (!self.context.getIsActive()) return;

                self.context.onFlowNode(self.id);

                forward("trigger");
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
        self.addOutput(
            "trigger",
            new ClassicPreset.Output(new TriggerSocket(), "trigger-out")
        );
    }
}

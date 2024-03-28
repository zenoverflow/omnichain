import { ClassicPreset } from "rete";

import { TriggerSocket } from "../_sockets/TriggerSocket";

import { NodeContextObj } from "../context";

import { NumberControl } from "../_controls/NumberControl";

export class TriggerIntervalNode extends ClassicPreset.Node<
    {},
    { trigger: TriggerSocket },
    { millis: NumberControl }
> {
    width: number = 280;
    height: number = 130;

    constructor(
        private context: NodeContextObj,
        id: string | null = null,
        controls: Record<string, any> = {}
    ) {
        super(TriggerIntervalNode.name);
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

                self.context.onFlowNode(self.id);

                return {};
            },
        });
        //
        //
        const run = () => {
            if (!self.context.getIsActive()) return;
            self.context.onAutoExecute(self.id);
            setTimeout(run, self.controls.millis.value);
        };
        //
        //
        self.addOutput(
            "trigger",
            new ClassicPreset.Output(new TriggerSocket(), "trigger-out")
        );
        this.addControl(
            "millis",
            new NumberControl({
                initial: controls.millis || 1000,
                name: "milliseconds",
                min: 10,
            })
        );
        //
        //
        run();
    }
}

import { ClassicPreset } from "rete";

import { NodeContextObj } from "../context";

import { TriggerSocket } from "../_sockets/TriggerSocket";
import { GeneralDataSocket } from "../_sockets/GeneralDataSocket";

export class LogOutputNode extends ClassicPreset.Node<
    { trigger: TriggerSocket; data: GeneralDataSocket },
    {},
    {}
> {
    width: number = 200;
    height: number = 125;

    constructor(
        private context: NodeContextObj,
        id: string | null = null,
        // @ts-ignore
        controls: Record<string, any> = {}
    ) {
        super(LogOutputNode.name);
        const self = this;
        self.id = id ?? self.id;
        //
        this.addInput(
            "trigger",
            new ClassicPreset.Input(new TriggerSocket(), "trigger-in")
        );
        this.addInput(
            "data",
            new ClassicPreset.Input(new GeneralDataSocket("Exec"), "data")
        );
        //
        //
        self.context.control.add(self, {
            inputs: () => ["trigger"],
            outputs: () => [],
            async execute(_: "trigger") {
                if (!self.context.getIsActive()) return;

                self.context.onFlowNode(self.id);

                const inputs = (await self.context.dataflow.fetchInputs(
                    self.id
                )) as {
                    data: any[];
                };

                self.context.onFlowNode(self.id);

                console.log(`LogNode:`, inputs.data[0]);
            },
        });
        self.context.dataflow.add(self, {
            inputs: () => ["data"],
            outputs: () => [],
            data() {
                if (!self.context.getIsActive()) return {};

                self.context.onFlowNode(self.id);

                return {};
            },
        });
    }
}
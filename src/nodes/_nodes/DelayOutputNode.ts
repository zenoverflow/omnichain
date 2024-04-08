import { ClassicPreset } from "rete";
import { HourglassOutlined } from "@ant-design/icons";

import { NodeContextObj } from "../context";
import { StringSocket } from "../_sockets/StringSocket";
import { NumberControl } from "../_controls/NumberControl";

export class DelayOutputNode extends ClassicPreset.Node<
    { dataIn: StringSocket },
    { dataOut: StringSocket },
    { millis: NumberControl }
> {
    public static icon = HourglassOutlined;
    width: number = 280;
    height: number = 170;

    constructor(
        private context: NodeContextObj,
        id: string | null = null,
        // @ts-ignore
        controls: Record<string, any> = {}
    ) {
        super(DelayOutputNode.name);
        const self = this;
        self.id = id ?? self.id;
        //
        self.addInput(
            "dataIn",
            new ClassicPreset.Input(new StringSocket(), "data")
        );
        self.addOutput(
            "dataOut",
            new ClassicPreset.Output(new StringSocket(), "data")
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
        // self.context.control.add(self, {
        //     inputs: () => [],
        //     outputs: () => ["trigger"],
        //     async execute(_: never, forward) {
        //     },
        // });
        self.context.dataflow.add(self, {
            inputs: () => ["dataIn"],
            outputs: () => ["dataOut"],
            async data(fetchInputs) {
                if (!self.context.getIsActive()) return {};

                self.context.onFlowNode(self.id);

                const inputs = (await fetchInputs()) as {
                    dataIn?: string[];
                };

                self.context.onFlowNode(self.id);

                await new Promise((r) =>
                    setTimeout(r, self.controls.millis.value)
                );

                return { dataOut: (inputs?.dataIn || [""])[0] };
            },
        });
    }
}

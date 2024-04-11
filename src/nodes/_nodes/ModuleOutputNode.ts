import { ClassicPreset } from "rete";
import { ExportOutlined } from "@ant-design/icons";

import { NodeContextObj } from "../context";
import { StringSocket } from "../_sockets/StringSocket";

export class ModuleOutputNode extends ClassicPreset.Node<
    { data: StringSocket },
    never,
    never
> {
    public static icon = ExportOutlined;
    width = 200;
    height = 90;

    constructor(
        private context: NodeContextObj,
        id?: string,
        controls?: Record<string, any>
    ) {
        super(ModuleOutputNode.name);
        const self = this;
        self.id = id ?? self.id;
        //
        self.addInput(
            "data",
            new ClassicPreset.Input(new StringSocket(), "data")
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
            inputs: () => ["data"],
            outputs: () => [],
            async data(fetchInputs) {
                if (!self.context.getIsActive()) return {};

                self.context.onFlowNode(self.id);

                const inputs = (await fetchInputs()) as {
                    data?: string[];
                };

                self.context.onFlowNode(self.id);

                return { data: (inputs?.data || [""])[0] };
            },
        });
    }
}

import { ClassicPreset } from "rete";

import { NodeContextObj } from "../context";

import { StringSocket } from "../_sockets/StringSocket";

export class ModuleOutputNode extends ClassicPreset.Node<
    { data: StringSocket },
    {},
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

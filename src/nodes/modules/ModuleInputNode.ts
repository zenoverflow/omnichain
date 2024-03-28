import { ClassicPreset } from "rete";

import { NodeContextObj } from "../context";

import { StringSocket } from "../_sockets/StringSocket";

/**
 * The value of this node is automatically
 * assigned via the ModuleNode running the module.
 * Multiple ModuleInputNode-s get the same value.
 */
export class ModuleInputNode extends ClassicPreset.Node<
    {},
    { data: StringSocket },
    {}
> {
    width: number = 200;
    height: number = 90;

    value: string = "";

    constructor(
        private context: NodeContextObj,
        id: string | null = null,
        // @ts-ignore
        controls: Record<string, any> = {}
    ) {
        super(ModuleInputNode.name);
        const self = this;
        self.id = id ?? self.id;
        //
        //
        // self.context.control.add(self, {
        //     inputs: () => [],
        //     outputs: () => ["trigger"],
        //     async execute(_: never, forward) {
        //     },
        // });
        self.context.dataflow.add(self, {
            inputs: () => [],
            outputs: () => [],
            async data() {
                if (!self.context.getIsActive()) return {};

                self.context.onFlowNode(self.id);

                return {
                    data: self.value,
                };
            },
        });
        //
        //
        self.addOutput(
            "data",
            new ClassicPreset.Output(new StringSocket(), "string")
        );
    }
}

import { ClassicPreset } from "rete";
import { ImportOutlined } from "@ant-design/icons";

import { NodeContextObj } from "../context";
import { StringSocket } from "../_sockets/StringSocket";

/**
 * The value of this node is automatically
 * assigned via the ModuleNode running the module.
 * Multiple ModuleInputNode-s get the same value.
 */
export class ModuleInputNode extends ClassicPreset.Node<
    never,
    { data: StringSocket },
    never
> {
    public static icon = ImportOutlined;
    width = 200;
    height = 90;

    value = "";

    constructor(
        private context: NodeContextObj,
        id?: string,
        controls?: Record<string, any>
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

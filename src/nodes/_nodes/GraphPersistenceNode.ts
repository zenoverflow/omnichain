import { ClassicPreset } from "rete";

import { NodeContextObj } from "../context";
import { PersistenceSocket } from "../_sockets/PersistenceSocket";
import { HiddenControl } from "../_controls/HiddenControl";

export class GraphPersistenceNode extends ClassicPreset.Node<
    {},
    { out: PersistenceSocket },
    { val: HiddenControl }
> {
    width: number = 350;
    height: number = 135;

    controlIds: Record<string, string> = {};

    constructor(
        private context: NodeContextObj,
        id: string,
        controls: Record<string, any> = {}
    ) {
        super(GraphPersistenceNode.name);
        const self = this;
        self.id = id ?? self.id;
        //
        //
        self.controlIds.val = [
            ...self.context.pathToGraph,
            self.id,
            "val",
        ].join("__");
        //
        //
        this.addControl(
            "val",
            new HiddenControl({
                initial: controls.val ?? "",
            })
        );
        this.addOutput(
            "out",
            new ClassicPreset.Output(
                new PersistenceSocket(),
                "provide persistence",
                true
            )
        );
        //
        //
        // self.control.add(self, {
        //     inputs: () => [],
        //     outputs: () => [],
        //     async execute(input, forward) {
        //         const inputs = await dataflow.fetchInputs(self.id);
        //         forward(0);
        //     },
        // });
        self.context.dataflow.add(self, {
            inputs: () => [],
            outputs: () => ["out"],
            data() {
                if (!self.context.getIsActive()) return {};

                self.context.onFlowNode(self.id);

                // const inputs = (await fetchInputs()) as {
                //     in?: string[];
                // };
                // self.context.onFlowNode(self.id);

                return {
                    out: {
                        async read() {
                            return self.controls.val.value;
                        },
                        async write(value: string) {
                            // Update control instance
                            const valControl = self.controls.val;
                            valControl.value = value;
                            // Update stored graph
                            self.context.onExecControlUpdate(
                                self.context.pathToGraph,
                                self.id,
                                "val",
                                valControl.value
                            );
                        },
                    },
                };
            },
        });
    }
}

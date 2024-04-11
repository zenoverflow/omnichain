import { ClassicPreset } from "rete";
import { FileTextOutlined } from "@ant-design/icons";

import { NodeContextObj } from "../context";
import { StringSocket } from "../_sockets/StringSocket";
import { TextControl } from "../_controls/TextControl";

export class TextNode extends ClassicPreset.Node<
    { in: StringSocket },
    { out: StringSocket },
    { val: TextControl }
> {
    public static icon = FileTextOutlined;
    width = 580;
    height = 450;

    controlIds: Record<string, string> = {};

    constructor(
        private context: NodeContextObj,
        id?: string,
        controls?: Record<string, any>
    ) {
        super(TextNode.name);
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
            new TextControl({
                id: self.controlIds.val,
                initial: controls?.val ?? "",
                large: true,
            })
        );
        this.addInput(
            "in",
            new ClassicPreset.Input(new StringSocket(), "write")
        );
        this.addOutput(
            "out",
            new ClassicPreset.Output(new StringSocket(), "read", true)
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
            inputs: () => ["in"],
            outputs: () => ["out"],
            async data(fetchInputs) {
                if (!self.context.getIsActive()) return {};

                self.context.onFlowNode(self.id);

                const inputs = (await fetchInputs()) as {
                    in?: string[];
                };

                self.context.onFlowNode(self.id);

                const valControl = self.controls.val;

                valControl.value = (inputs?.in || [""])[0] || valControl.value;

                // Update stored graph
                await self.context.onExecControlUpdate(
                    self.context.pathToGraph,
                    self.id,
                    "val",
                    valControl.value
                );

                // Update displayed graph
                if (self.context.haveGuiControls) {
                    let target: any;
                    while (!target) {
                        target = document.getElementById(
                            `${self.controlIds.val}`
                        );
                        await new Promise((r) => setTimeout(r, 10));
                    }
                    target.value = valControl.value;
                }

                return { out: valControl.value };
            },
        });
    }
}

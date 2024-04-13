import { ClassicPreset } from "rete";
import { FileTextOutlined } from "@ant-design/icons";

import { NodeContextObj } from "../context";
import { StringSocket } from "../_sockets/StringSocket";
import { TemplateSlotSocket } from "../_sockets/TemplateSlotSocket";
import { TextControl } from "../_controls/TextControl";

export class TemplateSlotNode extends ClassicPreset.Node<
    { in: StringSocket },
    { templateSlot: TemplateSlotSocket },
    { slotName: TextControl; val: TextControl }
> {
    public static icon = FileTextOutlined;
    width = 580;
    height = 490;

    constructor(
        private context: NodeContextObj,
        id?: string,
        controls?: Record<string, any>
    ) {
        super(TemplateSlotNode.name);
        const self = this;
        self.id = id ?? self.id;
        //
        //
        this.addControl(
            "slotName",
            new TextControl(
                self.id,
                "slotName",
                {
                    name: "slot name",
                    initial: controls?.slotName ?? "",
                },
                context
            )
        );
        this.addControl(
            "val",
            new TextControl(
                self.id,
                "val",
                {
                    initial: controls?.val ?? "",
                    large: true,
                },
                context
            )
        );
        //
        //
        this.addInput("in", new ClassicPreset.Input(new StringSocket(), "in"));
        this.addOutput(
            "templateSlot",
            new ClassicPreset.Output(
                new TemplateSlotSocket(),
                "template slot",
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
            inputs: () => ["in"],
            outputs: () => ["templateSlot"],
            async data(fetchInputs) {
                if (!self.context.getIsActive()) return {};

                const noSlotNameError = () => {
                    const e = new Error("Missing slot name in TemplateSlot!");
                    self.context.onError(e);
                    return e;
                };

                self.context.onFlowNode(self.id);

                if (!self.controls.slotName.value.length) {
                    throw noSlotNameError();
                }

                const inputs = (await fetchInputs()) as {
                    in?: string[];
                };

                self.context.onFlowNode(self.id);

                const valControl = self.controls.val;

                valControl.value = (inputs?.in || [""])[0] || valControl.value;

                // Update graph
                self.context.onControlChange(
                    self.context.pathToGraph,
                    self.id,
                    "val",
                    valControl.value
                );

                return {
                    templateSlot: {
                        name: self.controls.slotName.value,
                        value: valControl.value,
                    },
                };
            },
        });
    }
}

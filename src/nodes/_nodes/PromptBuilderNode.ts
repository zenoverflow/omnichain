import { ClassicPreset } from "rete";
import { FileTextOutlined } from "@ant-design/icons";

import { NodeContextObj } from "../context";
import { StringSocket } from "../_sockets/StringSocket";
import { TemplateSlotSocket } from "../_sockets/TemplateSlotSocket";
import { TextControl } from "../_controls/TextControl";

export class PromptBuilderNode extends ClassicPreset.Node<
    { parts: TemplateSlotSocket },
    { prompt: StringSocket },
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
        super(PromptBuilderNode.name);
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
            "parts",
            new ClassicPreset.Input(new TemplateSlotSocket(), "parts", true)
        );
        this.addOutput(
            "prompt",
            new ClassicPreset.Output(new StringSocket(), "prompt", true)
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
            inputs: () => ["parts"],
            outputs: () => ["prompt"],
            async data(fetchInputs) {
                if (!self.context.getIsActive()) return {};

                self.context.onFlowNode(self.id);

                const inputs = (await fetchInputs()) as {
                    parts?: {
                        name: string;
                        value: string;
                    }[];
                };

                self.context.onFlowNode(self.id);

                let prompt = self.controls.val.value;

                for (const { name, value } of inputs.parts ?? []) {
                    prompt = prompt.replaceAll("{" + name + "}", value);
                }

                return { prompt };
            },
        });
    }
}

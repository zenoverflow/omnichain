import { ClassicPreset } from "rete";
import { CodeOutlined } from "@ant-design/icons";

import { NodeContextObj } from "../context";
import { TriggerSocket } from "../_sockets/TriggerSocket";
import { GeneralDataSocket } from "../_sockets/GeneralDataSocket";
import { TextControl } from "../_controls/TextControl";

export class LogOutputNode extends ClassicPreset.Node<
    { trigger: TriggerSocket; data: GeneralDataSocket },
    never,
    { val: TextControl }
> {
    public static icon = CodeOutlined;
    width = 580;
    height = 480;

    constructor(
        private context: NodeContextObj,
        id?: string,
        controls?: Record<string, any>
    ) {
        super(LogOutputNode.name);
        const self = this;
        self.id = id ?? self.id;
        //
        //
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
                    data?: any[];
                };

                self.context.onFlowNode(self.id);

                const valControl = self.controls.val;

                valControl.value =
                    (inputs?.data || [""])[0] || valControl.value;

                // Update graph
                self.context.onControlChange(
                    self.context.pathToGraph,
                    self.id,
                    "val",
                    valControl.value
                );
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

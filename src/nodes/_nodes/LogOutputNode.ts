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

    controlIds: Record<string, string> = {};

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

                console.log("EXEC DIS");

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

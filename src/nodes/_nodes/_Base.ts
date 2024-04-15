import { ClassicPreset } from "rete";
import * as ICONS from "@ant-design/icons";

import { NodeContextObj } from "../context";
import { StringSocket } from "../_sockets/StringSocket";
import { NumberControl, NumberControlConfig } from "../_controls/NumberControl";
import { StringArraySocket } from "../_sockets/StringArraySocket";
import { TextControl, TextControlConfig } from "../_controls/TextControl";
import { SelectControl, SelectControlConfig } from "../_controls/SelectControl";
import { TriggerSocket } from "../_sockets/TriggerSocket";
import { TemplateSlotSocket } from "../_sockets/TemplateSlotSocket";

type CustomNodeBaseConfig = {
    nodeName: string;
    nodeIcon: string;
    dimensions: [number, number];
};

type CustomNodeIOConfig = {
    inputs: CustomIO[];
    outputs: CustomIO[];
    controls: CustomNodeControl[];
};

type CustomIO = {
    name: string;
    type: "trigger" | "string" | "stringArray" | "templateSlot";
    label?: string;
    multi?: boolean;
};

type CustomControlConfig =
    | { type: "text"; defaultValue: string; config: TextControlConfig }
    | { type: "number"; defaultValue: number; config: NumberControlConfig }
    | { type: "select"; defaultValue: string; config: SelectControlConfig };

type CustomNodeControl = {
    name: string;
    control: CustomControlConfig;
};

type CustomControlFlow = {
    inputs: string[];
    outputs: string[];
    logic: (
        node: any,
        context: NodeContextObj,
        controls: { [x: string]: string | number },
        fetchInputs: () => Promise<{ [x: string]: any[] }>,
        forward: (output: string) => void
    ) => Promise<void>;
};

type CustomDataFlow = {
    inputs: string[];
    outputs: string[];
    logic: (
        node: any,
        context: NodeContextObj,
        controls: { [x: string]: string | number },
        fetchInputs: () => Promise<{ [x: string]: any[] }>
    ) => Promise<{ [x: string]: any }>;
};

type CustomFlowConfig = {
    dataFlow?: CustomDataFlow;
    controlFlow?: CustomControlFlow;
};

const mkSocket = (socket: CustomIO["type"]) => {
    switch (socket) {
        case "trigger":
            return new TriggerSocket();
        case "string":
            return new StringSocket();
        case "stringArray":
            return new StringArraySocket();
        case "templateSlot":
            return new TemplateSlotSocket();
        default:
            throw new Error("Invalid socket type " + socket);
    }
};

const mkControl = (
    nodeId: string,
    nodeControl: string,
    context: NodeContextObj,
    controlData: CustomNodeControl["control"]
) => {
    const Maker = (() => {
        switch (controlData.type) {
            case "text":
                return TextControl;
            case "number":
                return NumberControl;
            case "select":
                return SelectControl;
            default:
                return null;
        }
    })();

    if (!Maker) {
        throw new Error("Invalid control type " + controlData.type);
    }

    // TS typing messed up here for code brevity.

    return new Maker(
        nodeId,
        nodeControl,
        // @ts-ignore
        controlData.defaultValue,
        // @ts-ignore
        controlData.config,
        context
    );
};

export const makeNode = (
    baseConfig: CustomNodeBaseConfig,
    ioConfig: CustomNodeIOConfig,
    flowConfig: CustomFlowConfig = null
) => {
    const { nodeName, nodeIcon, dimensions } = baseConfig;
    const { inputs, outputs, controls } = ioConfig;
    const { controlFlow, dataFlow } = flowConfig ?? {};

    // TODO: validation

    return class CustomNode extends ClassicPreset.Node<any, any, any> {
        //
        public static icon = (ICONS as any)[nodeIcon] ?? ICONS.BorderOutlined;
        width = dimensions[0];
        height = dimensions[1];

        constructor(
            public context: NodeContextObj,
            id: string | null = null, // for deserialization
            controlValues: Record<string, any> = {} // for deserialization
        ) {
            super(nodeName);
            const self = this;
            self.id = id ?? self.id;

            // Inputs
            for (const { name, label, type: socket, multi } of inputs) {
                self.addInput(
                    //
                    name,
                    new ClassicPreset.Input(
                        mkSocket(socket),
                        label ?? name,
                        multi ?? false
                    )
                );
            }
            // Outputs
            for (const { name, label, type, multi } of outputs) {
                self.addOutput(
                    //
                    name,
                    new ClassicPreset.Output(
                        mkSocket(type),
                        label ?? name,
                        multi ?? false
                    )
                );
            }
            // Controls
            for (const { name, control } of controls) {
                self.addControl(
                    //
                    name,
                    mkControl(self.id, name, context, control)
                );
                if (controlValues[name]) {
                    self.controls[name].value = controlValues[name];
                }
            }
            // Control flow setup
            if (controlFlow) {
                context.control.add(self, {
                    inputs: () => controlFlow.inputs as any,
                    outputs: () => controlFlow.outputs as any,
                    async execute(_: never, forward): Promise<void> {
                        if (!context.getIsActive()) return;

                        const _controls = Object.fromEntries(
                            controls.map(({ name }) => [
                                name,
                                self.controls[name].value,
                            ])
                        );

                        const _fetchInputs = async () => {
                            const result = await context.dataflow.fetchInputs(
                                self.id
                            );
                            context.onFlowNode(self.id);
                            return result;
                        };

                        context.onFlowNode(self.id);

                        try {
                            await controlFlow.logic(
                                self,
                                context,
                                _controls,
                                _fetchInputs,
                                forward
                            );
                        } catch (error) {
                            context.onError(error);
                            // Rethrow to stop exec
                            throw error;
                        }
                    },
                });
            }
            // Data flow setup
            if (dataFlow) {
                context.dataflow.add(self, {
                    inputs: () => dataFlow.inputs,
                    outputs: () => dataFlow.outputs,
                    async data(fetchInputs): Promise<{ [x: string]: any }> {
                        if (!context.getIsActive()) return {};

                        const _controls = Object.fromEntries(
                            controls.map(({ name }) => [
                                name,
                                self.controls[name].value,
                            ])
                        );

                        const _fetchInputs = async () => {
                            const result = await fetchInputs();
                            context.onFlowNode(self.id);
                            return result;
                        };

                        context.onFlowNode(self.id);

                        try {
                            return await dataFlow.logic(
                                self,
                                context,
                                _controls,
                                _fetchInputs
                            );
                        } catch (error) {
                            context.onError(error);
                            // Rethrow to stop exec
                            throw error;
                        }
                    },
                });
            }
        }
    };
};

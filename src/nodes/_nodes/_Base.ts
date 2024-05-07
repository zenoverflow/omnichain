import { ClassicPreset } from "rete";
import * as ICONS from "@ant-design/icons";
import Ajv from "ajv";

import { NodeContextObj } from "../context";
import { StringSocket } from "../_sockets/StringSocket";
import { NumberControl, NumberControlConfig } from "../_controls/NumberControl";
import { StringArraySocket } from "../_sockets/StringArraySocket";
import { TextControl, TextControlConfig } from "../_controls/TextControl";
import { SelectControl, SelectControlConfig } from "../_controls/SelectControl";
import { TriggerSocket } from "../_sockets/TriggerSocket";
import { TemplateSlotSocket } from "../_sockets/TemplateSlotSocket";
import { FileSocket } from "../_sockets/FileSocket";
import { FileArraySocket } from "../_sockets/FileArraySocket";
import { ChatMessageSocket } from "../_sockets/ChatMessageSocket";
import { ChatMessageArraySocket } from "../_sockets/ChatMessageArraySocket";

type CustomNodeBaseConfig = {
    nodeName: string;
    nodeIcon: string;
    dimensions: [number, number];
    doc: string;
};

type CustomNodeIOConfig = {
    inputs: CustomIO[];
    outputs: CustomIO[];
    controls: CustomNodeControl[];
};

type CustomIO = {
    name: string;
    type:
        | "trigger"
        | "string"
        | "stringArray"
        | "templateSlot"
        | "file"
        | "fileArray"
        | "chatMessage"
        | "chatMessageArray";
    label?: string;
    multi?: boolean;
};

type CustomControlConfig =
    | { type: "text"; defaultValue: string | null; config: TextControlConfig }
    | {
          type: "number";
          defaultValue: number | null;
          config: NumberControlConfig;
      }
    | {
          type: "select";
          defaultValue: string | null;
          config: SelectControlConfig;
      };

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
        fetchInputs: () => Promise<{ [x: string]: any[] | undefined }>,
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
        fetchInputs: () => Promise<{ [x: string]: any[] | undefined }>
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
        case "file":
            return new FileSocket();
        case "fileArray":
            return new FileArraySocket();
        case "chatMessage":
            return new ChatMessageSocket();
        case "chatMessageArray":
            return new ChatMessageArraySocket();
        default:
            throw new Error("Invalid socket type " + (socket as string));
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
        // @ts-expect-error
        controlData.defaultValue,
        controlData.config,
        context
    );
};

const ajv = new Ajv({
    allowUnionTypes: true,
});
const CLASSES = { Function: Function };

ajv.addKeyword({
    keyword: "instanceof",
    compile: (schema) => (data) => data instanceof (CLASSES as any)[schema],
});

const baseConfigSchema = ajv.compile<CustomNodeBaseConfig>({
    type: "object",
    properties: {
        nodeName: { type: "string" },
        nodeIcon: { type: "string" },
        dimensions: {
            type: "array",
            items: [{ type: "number" }, { type: "number" }],
            minItems: 2,
            maxItems: 2,
        },
        doc: { type: "string" },
    },
    required: ["nodeName", "nodeIcon", "dimensions", "doc"],
    additionalProperties: false,
});

const ioConfigSchema = ajv.compile<CustomNodeIOConfig>({
    type: "object",
    properties: {
        inputs: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    type: {
                        type: "string",
                        enum: [
                            "trigger",
                            "string",
                            "stringArray",
                            "templateSlot",
                            "file",
                            "fileArray",
                            "chatMessage",
                            "chatMessageArray",
                        ],
                    },
                    label: { type: "string" },
                    multi: { type: "boolean" },
                },
                required: ["name", "type"],
                additionalProperties: false,
            },
        },
        outputs: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    type: {
                        type: "string",
                        enum: [
                            "trigger",
                            "string",
                            "stringArray",
                            "templateSlot",
                            "file",
                            "fileArray",
                            "chatMessage",
                            "chatMessageArray",
                        ],
                    },
                    label: { type: "string" },
                    multi: { type: "boolean" },
                },
                required: ["name", "type"],
                additionalProperties: false,
            },
        },
        controls: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    control: {
                        type: "object",
                        properties: {
                            type: {
                                type: "string",
                                enum: ["text", "number", "select"],
                            },
                            defaultValue: {
                                type: ["string", "number", "null"],
                            },
                            config: { type: "object" },
                        },
                        required: ["type", "defaultValue", "config"],
                        additionalProperties: false,
                    },
                },
                required: ["name", "control"],
                additionalProperties: false,
            },
        },
    },
    required: ["inputs", "outputs", "controls"],
    additionalProperties: false,
});

const flowConfigSchema = ajv.compile<CustomFlowConfig>({
    type: "object",
    properties: {
        controlFlow: {
            type: "object",
            properties: {
                inputs: { type: "array" },
                outputs: { type: "array" },
                logic: { instanceof: "Function" },
            },
            required: ["inputs", "outputs", "logic"],
            additionalProperties: false,
        },
        dataFlow: {
            type: "object",
            properties: {
                inputs: { type: "array" },
                outputs: { type: "array" },
                logic: { instanceof: "Function" },
            },
            required: ["inputs", "outputs", "logic"],
            additionalProperties: false,
        },
    },
    additionalProperties: false,
});

export const makeNode = (
    baseConfig: CustomNodeBaseConfig,
    ioConfig: CustomNodeIOConfig,
    flowConfig: CustomFlowConfig | null = null
) => {
    // Validation
    if (!baseConfigSchema(baseConfig)) {
        throw new Error("Invalid node base config: " + ajv.errorsText());
    }
    if (!ioConfigSchema(ioConfig)) {
        throw new Error("Invalid node io config: " + ajv.errorsText());
    }
    if (flowConfig && !flowConfigSchema(flowConfig)) {
        throw new Error("Invalid node flow config: " + ajv.errorsText());
    }

    const { nodeName, nodeIcon, dimensions } = baseConfig;
    const { inputs, outputs, controls } = ioConfig;
    const { controlFlow, dataFlow } = flowConfig ?? {};

    const nodeNameClean = nodeName.trim();

    if (!nodeNameClean.length) {
        throw new Error("Node name cannot be empty");
    }

    return class CustomNode extends ClassicPreset.Node<any, any, any> {
        //
        public static customNodeName = nodeName;
        public static icon = (ICONS as any)[nodeIcon] ?? ICONS.BorderOutlined;
        public static staticDoc = baseConfig.doc;
        doc = baseConfig.doc;
        width = dimensions[0];
        height = dimensions[1];

        constructor(
            public context: NodeContextObj,
            id: string | null = null // for deserialization
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
            }
            // Control flow setup
            if (controlFlow) {
                context.control.add(self, {
                    inputs: () => controlFlow.inputs,
                    outputs: () => controlFlow.outputs,
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
                        } catch (error: any) {
                            // Will stop exec
                            context.onError(error);
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
                        } catch (error: any) {
                            // Will stop exec
                            context.onError(error);
                            throw error;
                        }
                    },
                });
            }
        }
    };
};

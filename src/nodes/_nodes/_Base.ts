import { ClassicPreset } from "rete";
import * as ICONS from "@ant-design/icons";
import Ajv from "ajv";

import { CustomControlFlow, CustomDataFlow, NodeContextObj } from "../context";
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

type CustomFlowConfig = {
    dataFlow?: CustomDataFlow;
    controlFlow?: CustomControlFlow;
};

type CustomNodeIOConfig = {
    inputs: CustomIO[];
    outputs: CustomIO[];
    controls: CustomNodeControl[];
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
        controlFlow: { instanceof: "Function" },
        dataFlow: { instanceof: "Function" },
    },
    additionalProperties: false,
});

export type CustomNode = {
    config: {
        baseConfig: CustomNodeBaseConfig;
        ioConfig: CustomNodeIOConfig;
        flowConfig: CustomFlowConfig | null;
    };
    icon: any;
    editorNode: (
        context: NodeContextObj,
        id?: string | null
    ) => ClassicPreset.Node<any, any, any>;
};

export const makeNode = (
    baseConfig: CustomNodeBaseConfig,
    ioConfig: CustomNodeIOConfig,
    flowConfig: CustomFlowConfig | null = null
): CustomNode => {
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
    // const { controlFlow, dataFlow } = flowConfig ?? {};

    const nodeNameClean = nodeName.trim();

    if (!nodeNameClean.length) {
        throw new Error("Node name cannot be empty");
    }

    return {
        config: { baseConfig, ioConfig, flowConfig },
        icon: (ICONS as any)[nodeIcon] ?? ICONS.BorderOutlined,
        editorNode: (context, id) => {
            class _NodeMaker extends ClassicPreset.Node<any, any, any> {
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
                }
            }
            return new _NodeMaker(context, id);
        },
    };
};

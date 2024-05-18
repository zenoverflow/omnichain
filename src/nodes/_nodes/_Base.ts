import * as ICONS from "@ant-design/icons";
import Ajv from "ajv";

import type {
    CustomFlowConfig,
    CustomNode,
    CustomNodeBaseConfig,
    CustomNodeIOConfig,
} from "../../data/typesCustomNodes";

const ajv = new Ajv({
    allowUnionTypes: true,
});

// const CLASSES = { Function: Function };

ajv.addKeyword({
    keyword: "instanceof",
    compile: (schema) => (data) =>
        data instanceof ({ Function: Function } as any)[schema],
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
                            readOnly: { type: "boolean" },
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

    const { nodeName, nodeIcon } = baseConfig;

    const nodeNameClean = nodeName.trim();

    if (!nodeNameClean.length) {
        throw new Error("Node name cannot be empty");
    }

    // Ensure outputs don't have multi set to true
    // if the type is trigger - that can break the engine.
    for (const output of ioConfig.outputs) {
        if (output.type === "trigger" && output.multi) {
            throw new Error(
                `Output ${output.name} has type trigger and multi set to true - this is not allowed`
            );
        }
    }

    // Set default multi values for inputs and outputs
    // Trigger inputs are always {multi: true} (unless specified)
    // Trigger outputs are always {multi: false} (throw error if specified)
    // Regular inputs are always {multi: false} (unless specified)
    // Regular outputs are always {multi: true} (unless specified)
    for (const input of ioConfig.inputs) {
        // Triggers
        if (input.type === "trigger" && input.multi === undefined) {
            input.multi = true;
        }
        // Regular inputs
        else if (input.multi === undefined) {
            input.multi = false;
        }
    }
    for (const output of ioConfig.outputs) {
        // Triggers
        if (output.type === "trigger" && output.multi === undefined) {
            output.multi = false;
        }
        // Regular outputs
        else if (output.multi === undefined) {
            output.multi = true;
        }
    }

    const outputs = [...ioConfig.outputs];

    // If control flow is used, add an error output
    if (flowConfig?.controlFlow) {
        outputs.push({
            name: "error",
            type: "trigger",
            label: "on error",
            multi: false,
        });
    }

    return {
        config: {
            baseConfig: { ...baseConfig, nodeName: nodeNameClean },
            ioConfig: {
                ...ioConfig,
                outputs,
            },
            flowConfig,
        },
        icon: (ICONS as any)[nodeIcon] ?? ICONS.BorderOutlined,
    };
};

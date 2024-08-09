import type { CustomControlFlow, CustomDataFlow } from "./typesExec";
import type { NumberControlConfig } from "../nodes/_controls/NumberControl";
import type { SelectControlConfig } from "../nodes/_controls/SelectControl";
import type { TextControlConfig } from "../nodes/_controls/TextControl";

export type CustomNodeBaseConfig = {
    nodeName: string;
    nodeIcon: string;
    dimensions: [number, number];
    doc: string;
};

export type CustomIO = {
    name: string;
    type:
        | "trigger"
        | "string"
        | "stringArray"
        | "slot"
        | "file"
        | "fileArray"
        | "chatMessage"
        | "chatMessageArray";
    label?: string;
    multi?: boolean;
};

export type CustomControlConfig =
    | {
          type: "text";
          defaultValue: string | null;
          readOnly?: boolean;
          config: TextControlConfig;
      }
    | {
          type: "number";
          defaultValue: number | null;
          readOnly?: boolean;
          config: NumberControlConfig;
      }
    | {
          type: "select";
          defaultValue: string | null;
          readOnly?: boolean;
          config: SelectControlConfig;
      };

export type CustomNodeControl = {
    name: string;
    control: CustomControlConfig;
};

export type CustomFlowConfig = {
    dataFlow?: CustomDataFlow;
    controlFlow?: CustomControlFlow;
};

export type CustomNodeIOConfig = {
    /**
     * Defines overrides that can be passed in via
     * the special 'override' input.
     *
     * Each key in the map should be a descriptive
     * name for a field, preferrably in snake_case.
     *
     * Each value value should be the key of the
     * control to override.
     */
    controlsOverride?: { [key: string]: string };

    inputs: CustomIO[];
    outputs: CustomIO[];
    controls: CustomNodeControl[];
};

export type CustomNode = {
    config: {
        baseConfig: CustomNodeBaseConfig;
        ioConfig: CustomNodeIOConfig;
        flowConfig: CustomFlowConfig | null;
    };
    icon: any;
};

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
        | "templateSlot"
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

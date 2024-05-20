import type { ChatMessage, SerializedGraph } from "./types";

export type ExecutionEvent = {
    type: "error" | "info" | "warning" | "success";
    text: string;
};

export type ExternalAction =
    | { type: "chatBlock"; args: { blocked: boolean } }
    | { type: "terminal"; args: { command: string } }
    | { type: "checkQueue"; args?: never }
    | { type: "readSessionMessages"; args?: never }
    | { type: "grabNextMessage"; args?: never }
    | { type: "readCurrentMessage"; args?: never }
    | { type: "addMessageToSession"; args: { message: ChatMessage } }
    | { type: "writeFile"; args: { path: string; content: string } }
    | { type: "readFile"; args: { path: string } }
    | { type: "saveGraph"; args?: never };

export type ControlUpdate = {
    graphId: string;
    node: string;
    control: string;
    value: string | number;
};

export type FlowContext = {
    graphId: string;

    getGraph: () => SerializedGraph;

    /**
     * The executor instance's ID.
     */
    instanceId: string;

    /**
     * Fetches inputs for a node.
     */
    fetchInputs: (
        nodeId: string
    ) => Promise<{ [x: string]: any[] | undefined }>;

    /**
     * Use for logging.
     */
    onEvent: (event: ExecutionEvent) => any;

    /**
     * For signalling control updates during flow execution.
     */
    onControlChange: (
        node: string,
        control: string,
        value: string | number
    ) => Promise<void>;

    /**
     * Allows nodes to trigger external actions such as
     * state changes, terminal commands, reading the message queue, etc.
     */
    onExternalAction: (action: ExternalAction) => Promise<any>;

    /**
     * Allows a node to grab its control values from storage.
     *
     * @returns The values of all the controls.
     */
    getAllControls: (nodeId: string) => { [x: string]: string | number | null };

    /**
     * Allows nodes to read API keys from storage.
     *
     * @param name name of the API key
     * @returns the API key string or null if not found
     */
    getApiKeyByName: (name: string) => string | null;

    /**
     * Lets nodes know when the flow has stopped executing.
     * Useful for cutting off long-running processes.
     *
     * @returns Whether the graph is active
     */
    getFlowActive: () => boolean;
};

export type CustomControlFlow = (
    nodeId: string,
    context: FlowContext,
    trigger: string
) => Promise<string | null>;

export type CustomDataFlow = (
    nodeId: string,
    context: FlowContext
) => Promise<{ [x: string]: any }>;

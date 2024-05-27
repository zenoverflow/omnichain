import type { ChatMessage, SerializedGraph } from "./types";

export type ExecutionEvent = {
    type: "error" | "info" | "warning" | "success";
    text: string;
};

export type ExtraAction =
    | { type: "chatBlock"; args: { blocked: boolean } }
    | { type: "checkQueue"; args?: never }
    | { type: "readSessionMessages"; args?: never }
    | { type: "clearSession"; args?: never }
    | { type: "grabNextMessage"; args?: never }
    | { type: "readCurrentMessage"; args?: never }
    | { type: "addMessageToSession"; args: { message: ChatMessage } }
    | { type: "saveGraph"; args?: never }
    | { type: "mkChatStore"; args?: never }
    | { type: "getChatStore"; args: { id: string } }
    | { type: "rmChatStore"; args: { id: string } }
    | {
          type: "addMessageToChatStore";
          args: { message: ChatMessage; id: string };
      };

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
     * For updating control values during flow execution.
     */
    updateControl: (
        node: string,
        control: string,
        value: string | number
    ) => Promise<void>;

    /**
     * Allows nodes to trigger special actions that tie into the executor.
     * This is useful for things like blocking the chat, reading messages, etc.
     *
     * @param action The action to perform.
     * @returns the result of the action, may be a value or null, depending on the action.
     */
    extraAction: (action: ExtraAction) => Promise<any>;

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

import type { SimpleObservable } from "../util/ObservableUtils";
import type { ChatMessage, SerializedGraph } from "../data/types";

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
    | { type: "saveGraph"; args?: never };

export type ControlUpdate = {
    graphId: string;
    node: string;
    control: string;
    value: string | number;
};

export type NodeContextObj = {
    headless: boolean;

    graphId: string;

    getGraph: () => SerializedGraph;

    /**
     * Used for both the editor and the executor.
     * During execution, this will be the executor's instance ID.
     */
    instanceId: string;

    /**
     * Used during execution. Will not be used in the visual editor.
     */
    fetchInputs?: (
        nodeId: string
    ) => Promise<{ [x: string]: any[] | undefined }>;

    /**
     * Use for logging.
     */
    onEvent: (event: ExecutionEvent) => any;

    /**
     * For signalling control updates, either from controls in the
     * visual editor, or from changes during graph flow execution.
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
     * Used to send updates down to a node's controls.
     *
     * @returns The observable for control updates.
     */
    getControlObservable: () => SimpleObservable<ControlUpdate> | null;

    /**
     * Used to send disabled state down to a node's controls.
     *
     * @returns The observable for control updates.
     */
    getControlDisabledObservable: () => SimpleObservable<
        [string, boolean]
    > | null;

    /**
     * Used to allow a node's controls to grab their values from state/storage.
     * May also be used inside flow logic to grab single control values.
     *
     * @returns The value of the control.
     */
    getControlValue: (
        nodeId: string,
        control: string
    ) => string | number | null;

    /**
     * Allows a node to grab all of its control values from state/storage.
     *
     * @returns The values of all the controls.
     */
    getAllControls: (nodeId: string) => { [x: string]: string | number | null };

    /**
     * Allows nodes to read API keys from state/storage.
     *
     * @param name name of the API key
     * @returns the API key string or null if not found
     */
    getApiKeyByName: (name: string) => string | null;

    /**
     * For tracking graph flow execution.
     * Should have slightly different implementations for the
     * editor and the executor.
     *
     * The editor implementation should return whether the graph
     * itself is active, in order to lock controls, the context menu, etc.
     *
     * The executor implementation should return whether the graph
     * is active, but also whether the context's instanceId matches
     * the executor's execId, because nodes may need to know if they
     * need to stop execution of their own logic in flow code.
     *
     * @returns Whether the graph is active
     */
    getFlowActive: () => boolean;
};

export type CustomControlFlow = (
    nodeId: string,
    context: NodeContextObj,
    trigger: string
) => Promise<string | null>;

export type CustomDataFlow = (
    nodeId: string,
    context: NodeContextObj
) => Promise<{ [x: string]: any }>;

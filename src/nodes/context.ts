import type { ClassicPreset, NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { ReactArea2D } from "rete-react-plugin";
import type { ContextMenuExtra } from "rete-context-menu-plugin";

import type { SimpleObservable } from "../util/ObservableUtils";
import type { ChatMessage, SerializedGraph } from "../data/types";

type ExecutionEvent = {
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

export type AreaExtra = ReactArea2D<any> | ContextMenuExtra;

export type ControlUpdate = {
    graphId: string;
    node: string;
    control: string;
    value: string | number;
};

export type NodeContextObj = {
    headless: boolean;

    graphId: string;

    editor?: NodeEditor<any>;

    area?: AreaPlugin<any, AreaExtra>;

    getGraph: () => SerializedGraph;

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
     * For signalling control updates, either from the UI, or from
     * changes during graph execution.
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
     * Allows a node's controls to grab their values from state/storage.
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
     * For tracking and stopping graph execution.
     *
     * @returns Whether the graph is active
     */
    getIsActive: () => boolean;

    /**
     * For node unselection in the plugin's internal state.
     */
    unselect: (id: string) => any;
};

export type CustomControlFlow = (
    node: ClassicPreset.Node,
    context: NodeContextObj,
    trigger: string
) => Promise<string | null>;

export type CustomDataFlow = (
    node: ClassicPreset.Node,
    context: NodeContextObj
) => Promise<{ [x: string]: any }>;

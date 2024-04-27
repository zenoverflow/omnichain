import type { NodeEditor } from "rete";
import type { ControlFlow, Dataflow } from "rete-engine";
import type { AreaPlugin } from "rete-area-plugin";
import type { ReactArea2D } from "rete-react-plugin";
import type { ContextMenuExtra } from "rete-context-menu-plugin";

import type { SimpleObservable } from "../util/ObservableUtils";

type ExecutionEvent = {
    type: "error" | "info" | "warning" | "success";
    text: string;
};

export type ExternalAction =
    | { type: "chatBlock"; args: { blocked: boolean } }
    | { type: "terminal"; args: { command: string } };

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
    editor: NodeEditor<any>;
    control: ControlFlow<any>;
    dataflow: Dataflow<any>;
    area?: AreaPlugin<any, AreaExtra>;

    /**
     * Use for logging.
     */
    onEvent: (event: ExecutionEvent) => any;

    /**
     * Use for error logging.
     */
    onError: (error: Error) => any;

    /**
     * For event-driven graph execution, via interval, poll, etc.
     */
    onAutoExecute: (nodeId: string) => any;

    /**
     * For handling control updates, either from the UI, or from
     * changes during graph execution.
     */
    onControlChange: (
        graphId: string,
        node: string,
        control: string,
        value: string | number
    ) => void;

    /**
     * Allows nodes to trigger external actions such as
     * state changes, terminal commands, etc.
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
        graphId: string,
        node: string,
        control: string
    ) => string | number | null;

    /**
     * Allows a node's controls to grab their disabled state from state/storage.
     *
     * @returns The disabled state of the control.
     */
    getControlDisabled: (graphId: string) => boolean;

    /**
     * For visually tracking graph execution.
     */
    onFlowNode: (nodeId: string) => any;

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

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

export type AreaExtra = ReactArea2D<any> | ContextMenuExtra;

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

    onControlChange: (
        graphId: string,
        node: string,
        control: string,
        value: string | number
    ) => void;

    getControlObservable: () => SimpleObservable<{
        graphId: string;
        node: string;
        control: string;
        value: string | number;
    }> | null;

    getControlValue: (
        graphId: string,
        node: string,
        control: string
    ) => string | number | null;

    /**
     * For visually tracking graph execution
     */
    onFlowNode: (nodeId: string) => any;

    /**
     * For tracking and stopping graph execution.
     *
     * @returns Whether the graph is active
     */
    getIsActive: () => boolean;

    /**
     * For node unselection in the plugin's internal state
     */
    unselect: (id: string) => any;
};

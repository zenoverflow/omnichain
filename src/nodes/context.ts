import { NodeEditor } from "rete";
import { ControlFlow, Dataflow } from "rete-engine";
import { AreaPlugin } from "rete-area-plugin";
import { ReactArea2D } from "rete-react-plugin";
import { ContextMenuExtra } from "rete-context-menu-plugin";

type ExecutionEvent = {
    type: "error" | "info" | "warning" | "success";
    text: string;
    pathToGraph: string[];
};

export type AreaExtra = ReactArea2D<any> | ContextMenuExtra;

export type NodeContextObj = {
    haveGuiControls: boolean;
    pathToGraph: string[];
    editor: NodeEditor<any>;
    control: ControlFlow<any>;
    dataflow: Dataflow<any>;
    area?: AreaPlugin<any, AreaExtra>;

    /**
     * Get module options for the current graph.
     */
    getModuleOptions: () => { label: string; value: string[] }[];

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
     * For saving node updates during execution
     */
    onExecControlUpdate: (
        pathToGraph: string[],
        node: string,
        control: string,
        value: string
    ) => any;

    /**
     * For visually tracking graph execution
     */
    onFlowNode: (execId: string) => any;

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

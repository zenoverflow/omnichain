import { createRoot } from "react-dom/client";
import { NodeEditor } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ConnectionPlugin } from "rete-connection-plugin";
import { ReactPlugin } from "rete-react-plugin";
import { ReadonlyPlugin } from "rete-readonly-plugin";
import { ControlFlow, Dataflow } from "rete-engine";
// import {
//     AutoArrangePlugin,
//     Presets as ArrangePresets,
//     ArrangeAppliers,
// } from "rete-auto-arrange-plugin";

import { appStore } from "../../state";
import { editorStateAtom } from "../../state/editor";
import {
    initGraph,
    listGraphModules,
    updateGraph,
    updateNodeControl,
} from "../../state/graphs";
import { watcherStateAtom } from "../../state/watcher";
import { showNotification } from "../../state/notifications";
import { isGraphActive, updateActiveNode } from "../../state/executor";
import { updateNodeSelection } from "../../state/nodeSelection";

import { makeContextMenu } from "../../nodes/contextMenu";
import { AreaExtra, NodeContextObj } from "../../nodes/context";

import { GraphWatcher } from "./GraphWatcher";
import { AreaSelection } from "./AreaSelection";
import { FlowWatcher } from "./FlowWatcher";
import { NodeCustomizer } from "./NodeCustomizer";
import { FlowCustomizer } from "./FlowCustomizer";
import { GraphTemplate } from "./GraphTemplate";
import { integrateMagneticConnection } from "./magconnection";

// const { TransitionApplier } = ArrangeAppliers;

export async function createEditor(container: HTMLElement) {
    const pathToGraph = appStore.get(editorStateAtom).path;
    const graphId = pathToGraph[0];
    // const activeOnInit = isGraphActive(graphId);

    const editor = new NodeEditor<any>();
    const control = new ControlFlow(editor);
    const dataflow = new Dataflow(editor);
    const area = new AreaPlugin<any, AreaExtra>(container);
    const connection = new ConnectionPlugin<any, AreaExtra>();
    const readonly = new ReadonlyPlugin<any>();
    const render = new ReactPlugin<any, AreaExtra>({
        createRoot,
    });

    const nodeContext: NodeContextObj = {
        headless: false,
        pathToGraph,
        editor,
        control,
        dataflow,
        area,
        getModuleOptions() {
            const editorPath = appStore.get(editorStateAtom).path;
            if (editorPath.length < 1) return [];
            return listGraphModules(editorPath[0]);
        },
        onEvent(event) {
            const { type, text } = event;
            showNotification({
                type,
                text,
                ts: Date.now(),
                duration: 3,
            });
        },
        onError(error) {
            showNotification({
                type: "error",
                text: (error as Error).message,
                ts: Date.now(),
                duration: 3,
            });
        },
        onAutoExecute(_) {
            // No exec from visual editor
        },
        onFlowNode(_) {
            // No exec from visual editor
        },
        onControlChange() {
            // No exec from visual editor
        },
        getIsActive() {
            return isGraphActive(graphId);
        },
        unselect() {
            //
        },
    };

    // const arrange = new AutoArrangePlugin<any>();
    makeContextMenu(nodeContext);
    // const applier = new TransitionApplier<any, never>({
    //     duration: 120,
    //     timingFunction: (t) => t,
    //     async onTick() {
    //         await AreaExtensions.zoomAt(area, editor.getNodes());
    //     },
    // });

    // Listen to value update signals from custom nodes' controls
    const watcherSubCleanup = appStore.sub(watcherStateAtom, () => {
        if (isGraphActive(graphId)) return;
        updateGraph(editor, area, pathToGraph, "subclean");
    });

    // // Readonly if running
    // if (activeOnInit) {
    //     editor.use(readonly.root);
    //     area.use(readonly.area);
    // }
    //
    // else {
    // EDIT: always use readonly plugin
    editor.use(readonly.root);
    area.use(readonly.area);
    // @ts-ignore
    connection.use(readonly.connection);

    const nodeSelector = AreaExtensions.selector();
    const nodeSelectorPlugin = AreaExtensions.selectableNodes(
        area,
        nodeSelector,
        {
            accumulating: AreaExtensions.accumulateOnCtrl(),
        }
    );
    nodeContext.unselect = nodeSelectorPlugin.unselect;
    // }

    editor.use(area);
    area.use(render);
    render.addPreset(NodeCustomizer.presetForNodes(nodeContext));

    // // Readonly if running
    // if (!activeOnInit) {
    area.use(connection);
    integrateMagneticConnection(nodeContext, connection);
    // area.use(arrange);

    connection.addPreset(FlowCustomizer.getFlowBuilder(connection));
    // arrange.addPreset(ArrangePresets.classic.setup());

    AreaSelection.activate(nodeContext);
    FlowWatcher.observe(nodeContext);
    // }

    try {
        await initGraph(nodeContext);

        GraphWatcher.observe(nodeContext);

        // Default content for new graphs
        if (editor.getNodes().length === 0) {
            await GraphTemplate.empty(nodeContext);
            await AreaExtensions.zoomAt(area, editor.getNodes());
            // Use of the ordering extension, unused
            // await arrange.layout({ applier });
            // AreaExtensions.simpleNodesOrder(area);
        }
    } catch (error) {
        console.error(error);
    }

    return {
        nodeContext,
        readonly,
        destroy: () => {
            // Clear selection
            const selectedNodes = editor
                .getNodes()
                .filter((n) => n.selected)
                .map((n) => n.id);
            for (const id of selectedNodes) {
                nodeContext.unselect(id);
            }
            updateNodeSelection([]);

            watcherSubCleanup();
            area.destroy();
        },
    };
}

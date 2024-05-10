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

import { editorTargetStorage } from "../../state/editor";
import { initGraph, updateNodeControl, graphStorage } from "../../state/graphs";
import {
    controlObservable,
    controlDisabledObservable,
} from "../../state/watcher";
import { showNotification } from "../../state/notifications";
import { isGraphActive } from "../../state/executor";
import { updateNodeSelection } from "../../state/nodeSelection";

import { makeContextMenu } from "../../nodes/contextMenu";
import { AreaExtra, NodeContextObj } from "../../nodes/context";

import { GraphWatcher } from "./GraphWatcher";
import { AreaSelectionWatcher } from "./AreaSelectionWatcher";
import { FlowWatcher } from "./FlowWatcher";
import { NodeCustomizer } from "./NodeCustomizer";
import { FlowCustomizer } from "./FlowCustomizer";
import { GraphTemplate } from "./GraphTemplate";
import { integrateMagCon } from "./magconnection";

// const { TransitionApplier } = ArrangeAppliers;

export async function createEditor(container: HTMLElement) {
    const graphId = editorTargetStorage.get();

    if (!graphId) {
        throw new Error("Tried to create editor without graph!");
    }

    const editor = new NodeEditor<any>();
    const control = new ControlFlow(editor);
    const dataflow = new Dataflow(editor);
    const area = new AreaPlugin<any, AreaExtra>(container);
    const connection = new ConnectionPlugin<any, AreaExtra>();
    const readonly = new ReadonlyPlugin<any>();
    const render = new ReactPlugin<any, AreaExtra>({
        createRoot,
    });

    const nodeSelector = AreaExtensions.selector();
    const nodeSelectorPlugin = AreaExtensions.selectableNodes(
        area,
        nodeSelector,
        {
            accumulating: AreaExtensions.accumulateOnCtrl(),
        }
    );
    // nodeContext.unselect = nodeSelectorPlugin.unselect;

    const nodeContext: NodeContextObj = {
        headless: false,
        graphId,
        editor,
        control,
        dataflow,
        area,
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
                text: error.message,
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
        async onControlChange(graphId, node, control, value) {
            updateNodeControl(graphId, node, control, value);
            controlObservable.next({ graphId, node, control, value });
        },
        async onExternalAction(_action) {
            // No external actions from visual editor
        },
        getControlObservable() {
            return controlObservable;
        },
        getControlDisabledObservable() {
            return controlDisabledObservable;
        },
        getControlValue(graphId, node, control) {
            const graph = graphStorage.get()[graphId];
            return graph.nodes.find((n) => n.nodeId === node)?.controls[
                control
            ] as string | number | null;
        },
        getApiKeyByName(_name) {
            // No API keys in visual editor
            return null;
        },
        getControlDisabled(graphId) {
            return isGraphActive(graphId);
        },
        getIsActive() {
            return isGraphActive(graphId);
        },
        unselect: nodeSelectorPlugin.unselect,
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

    editor.use(readonly.root);
    area.use(readonly.area);
    connection.use(readonly.connection as any);

    editor.use(area);
    area.use(render);
    render.addPreset(NodeCustomizer.presetForNodes(nodeContext));

    area.use(connection);
    integrateMagCon(nodeContext, connection);
    // area.use(arrange);

    connection.addPreset(FlowCustomizer.getFlowBuilder(connection));
    // arrange.addPreset(ArrangePresets.classic.setup());

    try {
        await initGraph(nodeContext);

        AreaSelectionWatcher.observe(nodeContext);
        FlowWatcher.observe(nodeContext);
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
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                .map((n) => n.id);
            for (const id of selectedNodes) {
                nodeContext.unselect(id);
            }
            updateNodeSelection([]);
            // Cleanup area
            area.destroy();
        },
    };
}

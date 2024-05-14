import { v4 as uuidv4 } from "uuid";
import { ClassicPreset } from "rete";

import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";

import type { NodeContextObj } from "../nodes/context";
import type { SerializedGraph, SerializedNode } from "../data/types";
import type { CAreaPlugin, CNodeEditor } from "../data/typesRete";
import type {
    CustomIO,
    CustomNodeControl,
    CustomNode,
} from "../data/typesCustomNodes";

// Sockets
import { TriggerSocket } from "../nodes/_sockets/TriggerSocket";
import { StringSocket } from "../nodes/_sockets/StringSocket";
import { StringArraySocket } from "../nodes/_sockets/StringArraySocket";
import { ChatMessageArraySocket } from "../nodes/_sockets/ChatMessageArraySocket";
import { ChatMessageSocket } from "../nodes/_sockets/ChatMessageSocket";
import { FileArraySocket } from "../nodes/_sockets/FileArraySocket";
import { FileSocket } from "../nodes/_sockets/FileSocket";
import { TemplateSlotSocket } from "../nodes/_sockets/TemplateSlotSocket";

// Controls
import { TextControl } from "../nodes/_controls/TextControl";
import { NumberControl } from "../nodes/_controls/NumberControl";
import { SelectControl } from "../nodes/_controls/SelectControl";

export const GraphUtils = {
    empty(name = "New Chain"): SerializedGraph {
        return {
            name,
            graphId: uuidv4(),
            nodes: [],
            connections: [],
            zoom: 1,
            areaX: 0,
            areaY: 0,
            created: Date.now(),
        };
    },

    serializeFromEditor(
        editor: NodeEditor<any>,
        area: AreaPlugin<any, any>,
        oldGraph: SerializedGraph
    ): SerializedGraph {
        const { k: zoom, x: areaX, y: areaY } = area.area.transform;
        return {
            ...oldGraph,
            zoom,
            areaX,
            areaY,

            nodes: editor.getNodes().map(
                //
                (n) => GraphUtils.serializeNode(area, n)
            ),

            connections: editor
                .getConnections()
                .map((c: ClassicPreset.Connection<any, any>) => ({
                    source: c.source,
                    sourceOutput: c.sourceOutput as string,
                    target: c.target,
                    targetInput: c.targetInput as string,
                }))
                .filter(
                    (c) =>
                        !!c.source &&
                        !!c.target &&
                        !!c.sourceOutput &&
                        !!c.targetInput
                ),
        };
    },

    async hydrate(
        graph: SerializedGraph,
        editor: CNodeEditor,
        area: CAreaPlugin,
        context: NodeContextObj,
        nodeRegistry: Record<string, CustomNode>
    ): Promise<void> {
        // Missing nodes check
        const missingNodes = graph.nodes.filter(
            (n) => !(nodeRegistry[n.nodeType] as CustomNode | undefined)
        );
        if (missingNodes.length > 0) {
            throw new Error(
                `Cannot load graph! Missing nodes: ${missingNodes
                    .map((n) => n.nodeType)
                    .join(", ")}`
            );
        }
        // Nodes
        for (const node of graph.nodes) {
            // Node
            await editor.addNode(
                GraphUtils.deserializeNode(node, context, nodeRegistry)
            );
            // Positions
            await area.nodeViews
                .get(node.nodeId)
                //
                ?.translate(node.positionX, node.positionY);
        }
        // Connections
        for (const c of graph.connections) {
            if (!c.source || !c.target) continue;

            await editor.addConnection(
                new ClassicPreset.Connection<any, any>(
                    editor.getNode(c.source),
                    c.sourceOutput,
                    editor.getNode(c.target),
                    c.targetInput
                )
            );
        }
        // Area zoom and pos
        const a = area.area;
        await a.zoom(graph.zoom);
        await a.translate(graph.areaX, graph.areaY);
    },

    serializeNode(
        area: AreaPlugin<any, any>,
        node: ClassicPreset.Node
    ): SerializedNode {
        const controlsEntries = Object.entries(node.controls).map(
            ([key, control]) => {
                const c = control as any;
                return [
                    key,
                    Object.keys(c).includes("value")
                        ? (c.value as string)
                        : null,
                ];
            }
        );
        const position = area.nodeViews.get(node.id)?.position;
        return {
            nodeType: node.label,
            nodeId: node.id,
            controls: Object.fromEntries(controlsEntries),
            positionX: position?.x ?? 0,
            positionY: position?.y ?? 0,
        };
    },

    deserializeNode(
        node: SerializedNode,
        context: NodeContextObj,
        nodeRegistry: Record<string, CustomNode>
    ) {
        return GraphUtils.mkEditorNode(
            node.nodeType,
            context,
            nodeRegistry,
            node.nodeId
        );
    },

    mkEditorNode(
        nodeType: string,
        context: NodeContextObj,
        nodeRegistry: Record<string, CustomNode>,
        nodeId: string | null = null,
        controlValueOverrdes: Record<string, string | number | null> = {}
    ) {
        const customNode = nodeRegistry[nodeType];

        const { inputs, outputs, controls } = customNode.config.ioConfig;

        class _NodeMaker extends ClassicPreset.Node<any, any, any> {
            doc = customNode.config.baseConfig.doc;
            width = customNode.config.baseConfig.dimensions[0];
            height = customNode.config.baseConfig.dimensions[1];

            constructor(
                public context: NodeContextObj,
                id: string | null = null // for deserialization
            ) {
                super(customNode.config.baseConfig.nodeName);
                const self = this;
                self.id = id ?? self.id;

                // Inputs
                for (const { name, label, type: socket, multi } of inputs) {
                    self.addInput(
                        //
                        name,
                        new ClassicPreset.Input(
                            GraphUtils.mkSocket(socket),
                            label ?? name,
                            multi ?? false
                        )
                    );
                }
                // Outputs
                for (const { name, label, type, multi } of outputs) {
                    self.addOutput(
                        //
                        name,
                        new ClassicPreset.Output(
                            GraphUtils.mkSocket(type),
                            label ?? name,
                            multi ?? false
                        )
                    );
                }
                // Controls
                for (const { name, control } of controls) {
                    self.addControl(
                        //
                        name,
                        GraphUtils.mkControl(
                            self.id,
                            name,
                            context,
                            control,
                            controlValueOverrdes[name]
                        )
                    );
                }
            }
        }
        return new _NodeMaker(context, nodeId);
    },

    mkSocket(socket: CustomIO["type"]) {
        switch (socket) {
            case "trigger":
                return new TriggerSocket();
            case "string":
                return new StringSocket();
            case "stringArray":
                return new StringArraySocket();
            case "templateSlot":
                return new TemplateSlotSocket();
            case "file":
                return new FileSocket();
            case "fileArray":
                return new FileArraySocket();
            case "chatMessage":
                return new ChatMessageSocket();
            case "chatMessageArray":
                return new ChatMessageArraySocket();
            default:
                throw new Error("Invalid socket type " + (socket as string));
        }
    },

    mkControl(
        nodeId: string,
        nodeControl: string,
        context: NodeContextObj,
        controlData: CustomNodeControl["control"],
        valueOverride?: string | number | null
    ) {
        const Maker = (() => {
            switch (controlData.type) {
                case "text":
                    return TextControl;
                case "number":
                    return NumberControl;
                case "select":
                    return SelectControl;
                default:
                    return null;
            }
        })();

        if (!Maker) {
            throw new Error("Invalid control type " + controlData.type);
        }

        // Typing is broken here, on purpose, for code brevity.

        return new Maker(
            nodeId,
            nodeControl,
            // @ts-expect-error
            valueOverride === undefined
                ? controlData.defaultValue
                : valueOverride,
            controlData.config,
            context
        );
    },
};

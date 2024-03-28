import { v4 as uuidv4 } from "uuid";
import { ClassicPreset, NodeEditor } from "rete";
import { AreaPlugin } from "rete-area-plugin";

import * as NODE_MAKERS from "../nodes";
import { NodeContextObj } from "../nodes/context";

export type SerializedNode = {
    nodeType: string;
    nodeId: string;
    controls: Record<string, any>;
    positionX: number;
    positionY: number;
};

export type SerializedGraph = {
    name: string;
    graphId: string;
    nodes: SerializedNode[];
    connections: any[];
    modules: Record<string, SerializedGraph>;
    zoom: number;
    areaX: number;
    areaY: number;
    created: number;
};

export class GraphUtils {
    public static empty(name: string = "New Chain"): SerializedGraph {
        return {
            name,
            graphId: uuidv4(),
            nodes: [],
            connections: [],
            modules: {},
            zoom: 1,
            areaX: 0,
            areaY: 0,
            created: Date.now(),
        };
    }

    public static serializeFromEditor(
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
                (n) => this.serializeNode(area, n)
            ),

            connections: editor
                .getConnections()
                .map((c: ClassicPreset.Connection<any, any>) => ({
                    source: c.source,
                    sourceOutput: c.sourceOutput,
                    target: c.target,
                    targetInput: c.targetInput,
                }))
                .filter(
                    (c) =>
                        !!c.source &&
                        !!c.target &&
                        !!c.sourceOutput &&
                        !!c.targetInput
                ),
        };
    }

    public static async hydrate(
        graph: SerializedGraph,
        context: NodeContextObj
    ): Promise<void> {
        const { editor } = context;
        // Nodes
        for (const n of graph.nodes) {
            // Node
            await editor.addNode(this.deserializeNode(n, context));
            // Positions
            await context.area?.nodeViews
                ?.get(n.nodeId)
                //
                ?.translate(n.positionX, n.positionY);
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
        if (context.area) {
            const a = context.area.area;
            await a.zoom(graph.zoom);
            await a.translate(graph.areaX, graph.areaY);
        }
    }

    //
    // UTIL
    //

    private static serializeNode(
        area: AreaPlugin<any, any>,
        node: ClassicPreset.Node
    ): SerializedNode {
        const controlsEntries = Object.entries(node.controls).map(
            ([key, control]) => {
                const c = control as any;
                return [key, Object.keys(c).includes("value") ? c.value : null];
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
    }

    private static deserializeNode(
        nodeObj: SerializedNode,
        context: NodeContextObj
    ) {
        const { nodeType, nodeId, controls } = nodeObj;

        const Maker = (NODE_MAKERS as any)[nodeType];
        const node = new Maker(context, nodeId, controls) as ClassicPreset.Node;

        return node;
    }
}
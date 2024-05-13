import type { NodeContextObj } from "../nodes/context";
import type { ClassicPreset } from "rete";
import type { CustomNode } from "../nodes/_nodes/_Base";

type _RuntimeInstance = { node: CustomNode; instance: ClassicPreset.Node };

type _InstanceMap = Record<string, _RuntimeInstance>;

type _EventHandlers = {
    onFlowNode: (nodeId: string) => any;
    onError: (error: Error) => any;
};

export const EngineUtils = {
    async runGraph(
        context: NodeContextObj,
        nodeRegistry: Record<string, CustomNode>,
        eventHandlers: _EventHandlers
    ): Promise<void> {
        // Missing nodes check
        const missingNodes = context
            .getGraph()
            .nodes.filter(
                (n) => !(nodeRegistry[n.nodeType] as CustomNode | undefined)
            );

        if (missingNodes.length > 0) {
            const missingNodeTypes = missingNodes
                .map((n) => n.nodeType)
                .join(", ");
            throw new Error(
                `Cannot load graph! Missing nodes: ${missingNodeTypes}`
            );
        }

        // Ensure presence of StartNode
        const startNode = context
            .getGraph()
            .nodes.find((n) => n.nodeType === "StartNode");

        if (!startNode) {
            throw new Error("Cannot run graph! Missing StartNode");
        }

        // Instantiate nodes
        const nodeInstances: _InstanceMap = Object.fromEntries(
            context.getGraph().nodes.map((n) => {
                const node = nodeRegistry[n.nodeType];
                const instance = node.editorNode(context, n.nodeId);
                return [n.nodeId, { node, instance }];
            })
        );

        // Enable nodes to fetch inputs by triggering dataflows
        context.fetchInputs = async (nodeId: string) => {
            // Signal node activity
            eventHandlers.onFlowNode(nodeId);

            const targetNode = nodeInstances[nodeId];

            // Use connections to fetch inputs
            const dataInputs = targetNode.node.config.ioConfig.inputs
                .filter((i) => i.type !== "trigger")
                .map((i) => i.name);
            // These are the connections that are data inputs to the target node
            const connections = context
                .getGraph()
                .connections.filter(
                    (c) =>
                        c.target === nodeId &&
                        dataInputs.includes(c.targetInput)
                );

            // Grab sources using map because there can be multiple connections
            // from the same source, and we don't want to re-run the dataflow
            const sources: _InstanceMap = connections.reduce(
                (acc, conn) =>
                    ({
                        ...acc,
                        [conn.source]: nodeInstances[conn.source],
                    } as _InstanceMap),
                {}
            );

            const inputs: { [x: string]: any[] | undefined } = {};

            for (const sourceInstance of Object.values(sources)) {
                const sourceName =
                    sourceInstance.node.config.baseConfig.nodeName;

                const sourceDataFlow =
                    sourceInstance.node.config.flowConfig?.dataFlow;

                if (!sourceDataFlow) {
                    throw new Error(
                        `Error in fetchInputs()! ${sourceName} does not have a data flow`
                    );
                }

                const controls = context
                    .getGraph()
                    .nodes.find(
                        (n) => n.nodeId === sourceInstance.instance.id
                    )?.controls;

                if (!controls) {
                    throw new Error(
                        `Error in fetchInputs()! Controls not found for ${sourceName}`
                    );
                }

                // Pass node activity signal to the target dataflow
                eventHandlers.onFlowNode(sourceInstance.instance.id);

                const output = await sourceDataFlow(
                    sourceInstance.instance,
                    context
                );
                if (!context.getFlowActive()) {
                    throw new Error("Execution aborted by user");
                }

                // Pass node activity signal back to the current node
                eventHandlers.onFlowNode(nodeId);

                for (const key of Object.keys(output)) {
                    const relatedConnection = connections.find(
                        (c) => c.sourceOutput === key
                    );
                    if (!relatedConnection) continue;

                    const targetInput = relatedConnection.targetInput;
                    if (!inputs[targetInput]) {
                        inputs[targetInput] = [];
                    }
                    inputs[targetInput]!.push(output[key]);
                }
            }

            return inputs;
        };

        // Control flow run target
        let currentControl = startNode.nodeId;
        let trigger = "triggerIn";

        // Run control flow
        while (currentControl && context.getFlowActive()) {
            try {
                const nodeInstance = nodeInstances[currentControl] as
                    | _RuntimeInstance
                    | undefined;

                if (!nodeInstance) break;

                const controlFlow =
                    nodeInstance.node.config.flowConfig?.controlFlow;

                if (!controlFlow) break;

                eventHandlers.onFlowNode(currentControl);
                const sourceOutput = await controlFlow(
                    nodeInstance.instance,
                    context,
                    trigger
                );
                if (!sourceOutput || !context.getFlowActive()) break;
                eventHandlers.onFlowNode(currentControl);

                // Find next node via connections
                const connection = context
                    .getGraph()
                    .connections.find(
                        (c) =>
                            c.source === currentControl &&
                            c.sourceOutput === sourceOutput
                    );

                if (
                    !connection ||
                    !connection.target ||
                    !connection.targetInput
                )
                    break;

                currentControl = connection.target;
                trigger = connection.targetInput;
            } catch (error: any) {
                eventHandlers.onError(error);
                break;
            }
        }
    },
};

import type { FlowContext } from "../data/typesExec";
import type { CustomNode } from "../data/typesCustomNodes";
import type { SerializedNode } from "../data/types";

type _RuntimeInstance = { node: CustomNode; instance: SerializedNode };

type _InstanceMap = Record<string, _RuntimeInstance>;

type _EventHandlers = {
    onFlowNode: (nodeId: string) => any;
    onError: (error: Error) => any;
};

export const EngineUtils = {
    async runGraph(
        context: FlowContext,
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
                return [n.nodeId, { node, instance: n }];
            })
        );

        // Enable nodes to fetch inputs by triggering dataflows
        context.fetchInputs = async (nodeId: string) => {
            // Signal node activity
            eventHandlers.onFlowNode(nodeId);

            const dataInputs = nodeInstances[nodeId].node.config.ioConfig.inputs
                .filter((i) => i.type !== "trigger")
                .map((i) => i.name);

            const sourceOutputs: Record<string, any> = {};

            const inputs: { [x: string]: any[] | undefined } = {};

            const addInputResult = (inputName: string, result: any) => {
                if (!inputs[inputName]) {
                    inputs[inputName] = [];
                }
                inputs[inputName].push(result);
            };

            for (const dataInput of dataInputs) {
                const dataInputConnections = context
                    .getGraph()
                    .connections.filter(
                        (c) =>
                            c.target === nodeId && c.targetInput === dataInput
                    );

                for (const connection of dataInputConnections) {
                    // Prevent pointless re-running of data flows in case
                    // node has multiple inputs from the same source
                    if (sourceOutputs[connection.source]) {
                        addInputResult(
                            dataInput,
                            sourceOutputs[connection.source][
                                connection.sourceOutput
                            ]
                        );
                        continue;
                    }

                    const sourceInstance = nodeInstances[connection.source];

                    const sourceName =
                        sourceInstance.node.config.baseConfig.nodeName;

                    const sourceDataFlow =
                        sourceInstance.node.config.flowConfig?.dataFlow;

                    if (!sourceDataFlow) {
                        throw new Error(
                            `Error in fetchInputs()! ${sourceName} does not have a data flow`
                        );
                    }

                    // Pass node activity signal to the target dataflow
                    eventHandlers.onFlowNode(sourceInstance.instance.nodeId);

                    const output = await sourceDataFlow(
                        sourceInstance.instance.nodeId,
                        context
                    );
                    sourceOutputs[connection.source] = output;
                    if (!context.getFlowActive()) {
                        throw new Error("Execution aborted by user");
                    }

                    // Pass node activity signal back to the current node
                    eventHandlers.onFlowNode(nodeId);

                    addInputResult(dataInput, output[connection.sourceOutput]);
                }
            }

            if (!context.getFlowActive()) {
                throw new Error("Execution aborted by user");
            }

            return inputs;
        };

        context.getControlsWithOverride = (nodeId, nodeInputs) => {
            const targetNode = nodeInstances[nodeId];

            const controls = {
                ...targetNode.instance.controls,
            };

            const overrideMap =
                targetNode.node.config.ioConfig.controlsOverride;

            if (!overrideMap) return controls;

            const override = (nodeInputs.override || [])[0];

            if (!override) return controls;

            const overrideObj = JSON.parse(override);

            for (const key of Object.keys(overrideMap)) {
                if (Object.keys(overrideObj).includes(key)) {
                    const controlKey = overrideMap[key];
                    controls[controlKey] = overrideObj[key];
                }
            }

            return controls;
        };

        // Utility function to find the next control-flow node via connections
        const findNextControlFlowNode = (
            currentControl: string,
            trigger: string
        ) => {
            const connection = context
                .getGraph()
                .connections.find(
                    (c) =>
                        c.source === currentControl &&
                        c.sourceOutput === trigger
                );

            if (!connection || !connection.target || !connection.targetInput) {
                return null;
            }

            return {
                nextControl: connection.target,
                nextTrigger: connection.targetInput,
            };
        };

        // Control flow run target
        let currentControl = startNode.nodeId;
        let currentTrigger = "triggerIn";

        // Run control flow
        while (currentControl && context.getFlowActive()) {
            try {
                const nodeInstance = nodeInstances[currentControl] as
                    | _RuntimeInstance
                    | undefined;

                if (!nodeInstance) break;

                eventHandlers.onFlowNode(currentControl);

                // SPECIAL CASE: ControlModuleNode
                if (nodeInstance.instance.nodeType === "ControlModuleNode") {
                    const moduleId =
                        context.getAllControls(currentControl).module;

                    // Find the unique ControlModuleIONode
                    const controlModuleIONodeId = context
                        .getGraph()
                        .nodes.find(
                            (n) =>
                                n.nodeType === "ControlModuleIONode" &&
                                context.getAllControls(n.nodeId).module ===
                                    moduleId
                        )?.nodeId;

                    // Error if no ControlModuleIONode found
                    if (!controlModuleIONodeId) {
                        throw new Error(
                            `No ControlModuleIO node for ID '${moduleId}'`
                        );
                    }

                    // Set caller ID on the ControlModuleIONode
                    await context.updateControl(
                        controlModuleIONodeId,
                        "caller",
                        currentControl
                    );

                    // Teleport execution the node connected to the ControlModuleIONode
                    const nextTarget = findNextControlFlowNode(
                        controlModuleIONodeId,
                        "triggerOut"
                    );

                    if (!nextTarget) break;

                    currentControl = nextTarget.nextControl;
                    currentTrigger = nextTarget.nextTrigger;

                    continue;
                }

                // SPECIAL CASE: ControlModuleIONode
                if (nodeInstance.instance.nodeType === "ControlModuleIONode") {
                    const caller =
                        context.getAllControls(currentControl).caller;

                    if (!caller) break;

                    // Teleport execution the node connected to the ControlModuleNode
                    const nextTarget = findNextControlFlowNode(
                        caller as string,
                        "triggerOut"
                    );

                    if (!nextTarget) break;

                    currentControl = nextTarget.nextControl;
                    currentTrigger = nextTarget.nextTrigger;

                    continue;
                }

                // Regular node

                const controlFlow =
                    nodeInstance.node.config.flowConfig?.controlFlow;

                if (!controlFlow) {
                    console.log(
                        "Stopping: No control flow for",
                        nodeInstance.node.config.baseConfig.nodeName
                    );
                    break;
                }

                const sourceOutput = await controlFlow(
                    nodeInstance.instance.nodeId,
                    context,
                    currentTrigger
                );

                if (!sourceOutput || !context.getFlowActive()) break;

                eventHandlers.onFlowNode(currentControl);

                // Find next node via connections
                const nextTarget = findNextControlFlowNode(
                    currentControl,
                    sourceOutput
                );

                if (!nextTarget) break;

                currentControl = nextTarget.nextControl;
                currentTrigger = nextTarget.nextTrigger;
            } catch (error: any) {
                console.error(error);
                eventHandlers.onError(error);
                break;
            }
        }
    },
};

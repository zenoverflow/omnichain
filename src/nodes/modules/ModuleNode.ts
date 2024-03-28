import { ClassicPreset, NodeEditor } from "rete";

import { ControlFlow, Dataflow } from "rete-engine";

import { NodeContextObj } from "../context";

import { StringSocket } from "../_sockets/StringSocket";

import { SelectControl } from "../_controls/SelectControl";

import { appStore } from "../../state";

import { graphStorageAtom } from "../../state/graphs";

import { GraphUtils } from "../../util/GraphUtils";

import { ModuleInputNode, ModuleOutputNode } from "..";

export class ModuleNode extends ClassicPreset.Node<
    { dataIn: StringSocket },
    { dataOut: StringSocket },
    { module: SelectControl }
> {
    width: number = 200;
    height: number = 170;

    constructor(
        private context: NodeContextObj,
        id: string | null = null,
        controls: Record<string, any> = {}
    ) {
        super(ModuleNode.name);
        const self = this;
        self.id = id ?? self.id;

        const moduleOptions = context.getModuleOptions();

        this.addInput(
            "dataIn",
            new ClassicPreset.Input(new StringSocket(), "data")
        );
        this.addOutput(
            "dataOut",
            new ClassicPreset.Output(new StringSocket(), "data")
        );
        this.addControl(
            "module",
            new SelectControl({
                values: moduleOptions,
                initial: controls.module || null,
            })
        );
        //
        //
        // self.context.control.add(self, {
        //     inputs: () => ["data"],
        //     outputs: () => ["data"],
        //     async execute(_: "trigger") {
        //     },
        // });
        self.context.dataflow.add(self, {
            inputs: () => ["dataIn"],
            outputs: () => ["dataOut"],
            async data(fetchInputs) {
                if (!self.context.getIsActive()) return {};

                const invaidModuleError = () => {
                    const e = new Error("Invalid module!");
                    self.context.onError(e);
                    return e;
                };
                const noInputError = () => {
                    const e = new Error("No input for module!");
                    self.context.onError(e);
                    return e;
                };

                self.context.onFlowNode(self.id);

                const inputs = (await fetchInputs()) as {
                    dataIn: string[];
                };

                self.context.onFlowNode(self.id);

                if (!inputs.dataIn || !inputs.dataIn.length) {
                    throw noInputError();
                }

                const [parentId, targetId] = self.controls.module.value ?? [
                    null,
                    null,
                ];

                if (!parentId || !targetId) {
                    throw invaidModuleError();
                }

                const graph =
                    appStore.get(graphStorageAtom)[parentId]?.modules[
                        targetId
                    ] ?? null;

                if (!graph) {
                    throw invaidModuleError();
                }

                // Headless editor
                const editor = new NodeEditor<any>();
                const control = new ControlFlow(editor);
                const dataflow = new Dataflow(editor);

                // Hydrate
                await GraphUtils.hydrate(graph, {
                    haveGuiControls: true,
                    pathToGraph: [parentId, targetId],
                    editor,
                    control,
                    dataflow,
                    getModuleOptions() {
                        /*
                        No graphical inputs in headless mode
                        Also value is set programmatically
                        on a higher-level object.
                        */
                        return [];
                    },
                    onEvent(event) {
                        self.context.onEvent(event);
                    },
                    onError(error) {
                        self.context.onError(error);
                    },
                    onAutoExecute(_) {
                        // No controlflow allowed in modules
                    },
                    onFlowNode(execId) {
                        self.context.onFlowNode(
                            [self.id, targetId, execId].join("__")
                        );
                    },
                    onExecControlUpdate(pathToGraph, node, control, value) {
                        self.context.onExecControlUpdate(
                            pathToGraph,
                            node,
                            control,
                            value
                        );
                    },
                    getIsActive() {
                        return self.context.getIsActive();
                    },
                    unselect() {},
                });

                if (!self.context.getIsActive()) return;

                // Locate input nodes
                const inputNodes: ModuleInputNode[] = editor
                    .getNodes()
                    .filter((n) => n instanceof ModuleInputNode);
                // Fill inputs with data
                for (const n of inputNodes) {
                    n.value = inputs.dataIn[0];
                }

                // Locate output nodes
                const outputNodes: ModuleOutputNode[] = editor
                    .getNodes()
                    .filter((n) => n instanceof ModuleOutputNode);

                if (outputNodes.length !== 1) {
                    console.warn(
                        "Modules should have exactly one ModuleOutput!"
                    );
                }

                // Grab result using the first (valid) output node
                const result = await dataflow.fetch(outputNodes[0].id);

                if (!self.context.getIsActive()) return;

                return {
                    dataOut: result.data,
                };
            },
        });
    }
}

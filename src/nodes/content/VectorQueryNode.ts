import { ClassicPreset } from "rete";

import { NodeContextObj } from "../context";
import { VectorQuerySocket } from "../_sockets/VectorQuerySocket";
import { VectorBatchSocket } from "../_sockets/VectorBatchSocket";
import { TextChunkBatchSocket } from "../_sockets/TextChunkBatchSocket";
import { NumberControl } from "../_controls/NumberControl";

export class VectorQueryNode extends ClassicPreset.Node<
    { in: VectorBatchSocket; query: VectorQuerySocket },
    { out: TextChunkBatchSocket },
    { similarity: NumberControl; limit: NumberControl }
> {
    width: number = 200;
    height: number = 245;

    constructor(
        private context: NodeContextObj,
        id: string | null = null,
        // @ts-ignore
        controls: Record<string, any> = {}
    ) {
        super(VectorQueryNode.name);
        const self = this;
        self.id = id ?? self.id;
        //
        self.addInput(
            "query",
            new ClassicPreset.Input(new VectorQuerySocket(), "query")
        );
        self.addInput(
            "in",
            new ClassicPreset.Input(new VectorBatchSocket(), "input")
        );
        self.addOutput(
            "out",
            new ClassicPreset.Output(new TextChunkBatchSocket(), "texts")
        );
        self.addControl(
            "similarity",
            new NumberControl({
                initial: controls.similarity || 0.7,
                name: "similarity",
                min: 0.1,
                max: 1.0,
            })
        );
        self.addControl(
            "limit",
            new NumberControl({
                initial: controls.limit || 12,
                name: "limit",
                min: 1,
            })
        );
        //
        //
        // self.context.control.add(self, {
        //     inputs: () => [],
        //     outputs: () => ["trigger"],
        //     async execute(_: never, forward) {
        //     },
        // });
        self.context.dataflow.add(self, {
            inputs: () => ["in", "query"],
            outputs: () => [],
            async data(fetchInputs) {
                if (!self.context.getIsActive()) return {};

                self.context.onFlowNode(self.id);

                const inputs = (await fetchInputs()) as {
                    in?: number[][];
                    query?: {
                        read: (
                            vectors: number[][],
                            treshold: number,
                            capacity: number
                        ) => Promise<string[]>;
                    }[];
                };

                self.context.onFlowNode(self.id);

                let results: string[] = [];

                if (!inputs.in?.length || !inputs.query?.length) {
                    let m = "VectorQuery missing";
                    if (!inputs.in) m += " input";
                    if (!inputs.query) m += " query (data source)";
                    m += "!";
                    const e = new Error(m);
                    self.context.onError(e);
                    throw e;
                }

                try {
                    results = await inputs.query[0].read(
                        inputs.in,
                        self.controls.similarity.value,
                        self.controls.limit.value
                    );
                } catch (error) {
                    console.error(error);
                    const e = new Error("VectorQuery failed!");
                    self.context.onError(e);
                    throw e;
                }

                return { out: results };
            },
        });
    }
}

import { ClassicPreset } from "rete";
import sodium from "libsodium-wrappers";

import { NodeContextObj } from "../context";
import { TextChunkBatchSocket } from "../_sockets/TextChunkBatchSocket";
import { VectorBatchSocket } from "../_sockets/VectorBatchSocket";

export class HashVectorizerNode extends ClassicPreset.Node<
    { dataIn: TextChunkBatchSocket },
    { dataOut: VectorBatchSocket },
    {}
> {
    width: number = 260;
    height: number = 125;

    constructor(
        private context: NodeContextObj,
        id: string | null = null,
        // @ts-ignore
        controls: Record<string, any> = {}
    ) {
        super(HashVectorizerNode.name);
        const self = this;
        self.id = id ?? self.id;
        //
        self.addInput(
            "dataIn",
            new ClassicPreset.Input(new TextChunkBatchSocket(), "chunks")
        );
        self.addOutput(
            "dataOut",
            new ClassicPreset.Output(new VectorBatchSocket(), "vectors")
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
            inputs: () => ["dataIn"],
            outputs: () => ["dataOut"],
            async data(fetchInputs) {
                if (!self.context.getIsActive()) return {};

                self.context.onFlowNode(self.id);

                const inputs = (await fetchInputs()) as {
                    dataIn?: string[][];
                };

                self.context.onFlowNode(self.id);

                let output: { text: string; vector: number[] }[] = [];

                try {
                    const texts: string[] = (inputs.dataIn ?? []).flat();
                    output = texts.map((t) => ({
                        text: t,
                        vector: Array.from(sodium.crypto_generichash(64, t)),
                    }));
                } catch (error) {
                    console.error(error);

                    const e = new Error("HashVectorizerNode failed!");
                    self.context.onError(e);

                    throw e;
                }

                return { dataOut: output };
            },
        });
    }
}

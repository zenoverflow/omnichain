import { ClassicPreset } from "rete";

import { NodeContextObj } from "../context";
import { VectorQuerySocket } from "../_sockets/VectorQuerySocket";
import { VectorBatchSocket } from "../_sockets/VectorBatchSocket";
import { TriggerSocket } from "../_sockets/TriggerSocket";

export class VectorWriteNode extends ClassicPreset.Node<
    { trigger: TriggerSocket; in: VectorBatchSocket; query: VectorQuerySocket },
    { done: TriggerSocket },
    {}
> {
    width: number = 200;
    height: number = 195;

    constructor(
        private context: NodeContextObj,
        id: string | null = null,
        // @ts-ignore
        controls: Record<string, any> = {}
    ) {
        super(VectorWriteNode.name);
        const self = this;
        self.id = id ?? self.id;
        //
        self.addInput(
            "trigger",
            new ClassicPreset.Input(new TriggerSocket(), "trigger")
        );
        self.addInput(
            "query",
            new ClassicPreset.Input(new VectorQuerySocket(), "query")
        );
        self.addInput(
            "in",
            new ClassicPreset.Input(new VectorBatchSocket(), "vectors")
        );
        self.addOutput(
            "done",
            new ClassicPreset.Output(new TriggerSocket(), "when done")
        );
        //
        //
        self.context.control.add(self, {
            inputs: () => ["trigger"],
            outputs: () => ["done"],
            async execute(_: "trigger", forward) {
                self.context.onFlowNode(self.id);

                const inputs = (await self.context.dataflow.fetchInputs(
                    self.id
                )) as {
                    in?: { text: string; vector: number[] }[][];
                    query?: {
                        write: (
                            data: { text: string; vector: number[] }[]
                        ) => Promise<void>;
                    }[];
                };

                self.context.onFlowNode(self.id);

                if (!inputs.in?.length || !inputs.query?.length) {
                    let m = "VectorWrite missing";
                    if (!inputs.in) m += " input";
                    if (!inputs.query) m += " query (data source)";
                    m += "!";
                    const e = new Error(m);
                    self.context.onError(e);
                    throw e;
                }

                await inputs.query[0].write(inputs.in.flat());

                forward("done");
            },
        });
        self.context.dataflow.add(self, {
            inputs: () => ["in", "query"],
            outputs: () => [],
            async data() {
                if (!self.context.getIsActive()) return {};

                self.context.onFlowNode(self.id);

                return {};
            },
        });
    }
}

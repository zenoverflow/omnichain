import { ClassicPreset } from "rete";

import { NodeContextObj } from "../context";
import { PersistenceSocket } from "../_sockets/PersistenceSocket";
import { VectorQuerySocket } from "../_sockets/VectorQuerySocket";
import { MemoRex, RawVector } from "../../util/MemoRex";

export class MemoRexNode extends ClassicPreset.Node<
    { persistence: PersistenceSocket },
    { out: VectorQuerySocket },
    {}
> {
    width: number = 200;
    height: number = 130;

    private memoRex: MemoRex = new MemoRex();

    constructor(
        private context: NodeContextObj,
        id: string | null = null,
        // @ts-ignore
        controls: Record<string, any> = {}
    ) {
        super(MemoRexNode.name);
        const self = this;
        self.id = id ?? self.id;
        //
        this.addInput(
            "persistence",
            new ClassicPreset.Input(
                new PersistenceSocket(),
                "save data somewhere"
            )
        );
        this.addOutput(
            "out",
            new ClassicPreset.Output(new VectorQuerySocket(), "provide query")
        );
        //
        //
        // self.context.control.add(self, {
        //     inputs: () => [],
        //     outputs: () => [],
        //     async execute() {},
        // });
        self.context.dataflow.add(self, {
            inputs: () => ["persistence"],
            outputs: () => ["out"],
            async data(fetchInputs) {
                if (!self.context.getIsActive()) return {};

                self.context.onFlowNode(self.id);

                const inputs = (await fetchInputs()) as {
                    persistence?: {
                        write: (data: any) => Promise<any>;
                        read: () => Promise<any>;
                    }[];
                };

                self.context.onFlowNode(self.id);

                // Sync with persistence
                if (inputs.persistence?.length) {
                    const data = await inputs.persistence[0].read();
                    if (data) self.memoRex.restore(data);
                }

                return {
                    out: {
                        async read(
                            vectors: RawVector[],
                            treshold: number = 0.7,
                            capacity: number = 12
                        ): Promise<string[]> {
                            let results = vectors.flatMap((vector) =>
                                self.memoRex.chainRemember(
                                    vector,
                                    treshold,
                                    capacity
                                )
                            );

                            // TODO: utilize rel further?
                            // if (results.length < capacity) {
                            // }

                            return results.map((item) => item.memo.text);
                        },
                        async write(
                            data: { text: string; vector: RawVector }[]
                        ): Promise<void> {
                            // Ingest vectors
                            for (const item of data) {
                                // TODO: fix MemoRex to include text with vectors
                                self.memoRex.experience(item.text, item.vector);
                            }
                            // Save to persistence
                            if (inputs.persistence?.length) {
                                await inputs.persistence[0].write(
                                    self.memoRex.getJson()
                                );
                            }
                        },
                    },
                };
            },
        });
        // Run MemoRex relator process
        const stopRelatorProcess = self.memoRex.relatorProcess();
        let stopCheckInterval: any;
        stopCheckInterval = setInterval(() => {
            if (!self.context.getIsActive()) {
                clearInterval(stopCheckInterval);
                stopRelatorProcess();
            }
        });
    }
}

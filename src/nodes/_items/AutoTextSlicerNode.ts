import { ClassicPreset } from "rete";
import { GroupOutlined } from "@ant-design/icons";

import { NodeContextObj } from "../context";
import { StringSocket } from "../_sockets/StringSocket";
import { TextChunkBatchSocket } from "../_sockets/TextChunkBatchSocket";
import { NumberControl } from "../_controls/NumberControl";

const SEPARATORS = [".", "!", "?", "。", "！", "？", "।", "،", "؛", "؟"];

const _granularSplit = (text: string, chunkLimit: number): string[] => {
    const chunks = [];

    let currentChunk = "";
    let currentSentence = "";

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        currentSentence += char;
        if (SEPARATORS.includes(char)) {
            // period is not a sentence separator if part of a float
            if (char === "." && i > 0 && i < text.length - 1) {
                if (
                    !isNaN(Number(text[i - 1])) &&
                    !isNaN(Number(text[i + 1]))
                ) {
                    continue;
                }
            }
            // we know this is the end of the sentence
            // so we see if the sentence can fit into the current chunk
            if ((currentChunk + currentSentence).length <= chunkLimit) {
                currentChunk += currentSentence;
                currentSentence = "";
            }
            //
            else {
                chunks.push(currentChunk.trim());
                currentChunk = "";
            }
        }
        // prevent sentence overflow due to lack of separators
        else if (currentSentence.length >= chunkLimit) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = "";
            }
            chunks.push(currentSentence.trim());
            currentSentence = "";
        }
    }

    if (
        currentSentence &&
        (currentChunk + currentSentence).length <= chunkLimit
    ) {
        currentChunk += currentSentence;
        currentSentence = "";
    }
    if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
        if (currentSentence) {
            chunks.push(currentSentence.trim());
            currentSentence = "";
        }
    }

    return chunks;
};

const _roughSplit = (
    text: string,
    chunkLimit: number,
    sep: string = "\n\n"
): string[] | null => {
    const chunks = text.split(sep).map((c) => c.trim());
    // no result if not meeting size restraint conditon
    for (const c of chunks) {
        if (c.length > chunkLimit) {
            return null;
        }
    }
    return chunks;
};

export class AutoTextSlicerNode extends ClassicPreset.Node<
    { dataIn: StringSocket },
    { dataOut: TextChunkBatchSocket },
    { chunkCharacters: NumberControl }
> {
    public static icon = GroupOutlined;
    width: number = 260;
    height: number = 165;

    constructor(
        private context: NodeContextObj,
        id: string | null = null,
        controls: Record<string, any> = {}
    ) {
        super(AutoTextSlicerNode.name);
        const self = this;
        self.id = id ?? self.id;
        //
        self.addInput(
            "dataIn",
            new ClassicPreset.Input(new StringSocket(), "text")
        );
        self.addOutput(
            "dataOut",
            new ClassicPreset.Output(new TextChunkBatchSocket(), "chunks")
        );
        self.addControl(
            "chunkCharacters",
            new NumberControl({
                initial: controls.chunkCharacters || 1000,
                name: "chunkCharacters",
                min: 10,
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
            inputs: () => ["dataIn"],
            outputs: () => ["dataOut"],
            async data(fetchInputs) {
                if (!self.context.getIsActive()) return {};

                self.context.onFlowNode(self.id);

                const inputs = (await fetchInputs()) as {
                    dataIn?: string[];
                };

                const text = (inputs.dataIn ?? [""])[0];
                const chunkLimit = self.controls.chunkCharacters.value;

                self.context.onFlowNode(self.id);

                let output: string[] | null = [];

                try {
                    // try roughest split by \n\n
                    output = _roughSplit(text, chunkLimit);
                    // if it fails, try a finer split by \n
                    if (!output) {
                        output = _roughSplit(text, chunkLimit, "\n");
                    }
                    // if that also fails, do granular splitting (always gives results)
                    output = _granularSplit(text, chunkLimit);
                } catch (error) {
                    console.error(error);

                    const e = new Error("AutoTextSlicer failed!");
                    self.context.onError(e);

                    throw e;
                }

                return { dataOut: output ?? [] };
            },
        });
    }
}

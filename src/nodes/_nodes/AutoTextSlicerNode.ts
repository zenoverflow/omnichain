import { makeNode } from "./_Base";

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
    sep = "\n\n"
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

export const AutoTextSlicerNode = makeNode(
    {
        nodeName: "AutoTextSlicerNode",
        nodeIcon: "GroupOutlined",
        dimensions: [300, 165],
    },
    {
        inputs: [{ name: "dataIn", type: "string", label: "text" }],
        outputs: [{ name: "dataOut", type: "stringArray", label: "chunks" }],
        controls: [
            {
                name: "chunkCharacters",
                control: {
                    type: "number",
                    defaultValue: 1000,
                    config: {
                        label: "chunk characters",
                        min: 1,
                    },
                },
            },
        ],
    },
    {
        dataFlow: {
            inputs: ["dataIn"],
            outputs: ["dataOut"],
            async logic(node, context, controls, fetchInputs) {
                const inputs = (await fetchInputs()) as {
                    dataIn?: string[];
                };
                const text = (inputs.dataIn ?? [""])[0];
                const chunkLimit = controls["chunkCharacters"] as number;

                let output: string[] | null = [];

                // try roughest split by \n\n
                output = _roughSplit(text, chunkLimit);
                // if it fails, try a finer split by \n
                if (!output) {
                    output = _roughSplit(text, chunkLimit, "\n");
                }
                // if that also fails, do granular splitting (always gives results)
                output = _granularSplit(text, chunkLimit);

                return { dataOut: output ?? [] };
            },
        },
    }
);

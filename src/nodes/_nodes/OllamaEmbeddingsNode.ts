import { Ollama } from "ollama";

import { makeNode } from "./_Base";

const doc = [
    "Generate embeddings using Ollama's embeddings API (/api/embeddings).",
    "The API key name property is used to reference an API key set via",
    "the API key management dialog from the top bar.",
    "Note that you can unload a model by setting keep_alive to 0.",
    "The result is returned as a JSON-encoded string, which contains",
    "the embedding (an array of numbers) for the input text.",
]
    .join(" ")
    .trim();

export const OllamaEmbeddingsNode = makeNode(
    {
        nodeName: "OllamaEmbeddingsNode",
        nodeIcon: "LaptopOutlined",
        dimensions: [620, 970],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "prompt",
                type: "string",
            },
        ],
        outputs: [
            //
            { name: "result", type: "string" },
        ],

        // includes all controls
        // keys are display names in snake_case
        // values are the real control names
        controlsOverride: {
            model: "model",
            mirostat: "mirostat",
            mirostat_eta: "mirostatEta",
            mirostat_tau: "mirostatTau",
            num_ctx: "numCtx",
            repeat_last_n: "repeatLastN",
            repeat_penalty: "repeatPenalty",
            temperature: "temperature",
            seed: "seed",
            stop: "stop",
            tfs_z: "tfsZ",
            num_predict: "numPredict",
            top_k: "topK",
            top_p: "topP",
            host: "host",
            keep_alive: "keepAlive",
        },
        controls: [
            {
                name: "model",
                control: {
                    type: "text",
                    defaultValue: "nomic-embed-text",
                    config: {
                        label: "model",
                    },
                },
            },
            {
                name: "mirostat",
                control: {
                    type: "select",
                    defaultValue: "0",
                    config: {
                        label: "mirostat",
                        values: [
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                            { value: "2", label: "2" },
                        ],
                    },
                },
            },
            {
                name: "mirostatEta",
                control: {
                    type: "number",
                    defaultValue: 0.1,
                    config: {
                        label: "mirostat_eta",
                        min: 0.05,
                        max: 0.2,
                    },
                },
            },
            {
                name: "mirostatTau",
                control: {
                    type: "number",
                    defaultValue: 5.0,
                    config: {
                        label: "mirostat_tau",
                        min: 0.1,
                    },
                },
            },
            {
                name: "numCtx",
                control: {
                    type: "number",
                    defaultValue: 2048,
                    config: {
                        label: "num_ctx",
                        min: 1,
                    },
                },
            },
            {
                name: "repeatLastN",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "repeat_last_n",
                        min: -1,
                    },
                },
            },
            {
                name: "repeatPenalty",
                control: {
                    type: "number",
                    defaultValue: 1.1,
                    config: {
                        label: "repeat_penalty",
                        min: 0,
                    },
                },
            },
            {
                name: "temperature",
                control: {
                    type: "number",
                    defaultValue: 0.8,
                    config: {
                        label: "temperature",
                        min: 0,
                    },
                },
            },
            {
                name: "seed",
                control: {
                    type: "number",
                    defaultValue: null,
                    config: {
                        label: "seed",
                    },
                },
            },
            {
                name: "stop",
                control: {
                    type: "text",
                    defaultValue: null,
                    config: {
                        label: "stop (comma-separated)",
                    },
                },
            },
            {
                name: "tfsZ",
                control: {
                    type: "number",
                    defaultValue: 1.0,
                    config: {
                        label: "tfs_z",
                        min: 1.0,
                    },
                },
            },
            {
                name: "numPredict",
                control: {
                    type: "number",
                    defaultValue: 128,
                    config: {
                        label: "num_predict",
                        min: -2,
                    },
                },
            },
            {
                name: "topK",
                control: {
                    type: "number",
                    defaultValue: 20,
                    config: {
                        label: "top_k",
                        min: 0,
                    },
                },
            },
            {
                name: "topP",
                control: {
                    type: "number",
                    defaultValue: 1.0,
                    config: {
                        label: "top_p",
                        min: 0.01,
                        max: 1.0,
                    },
                },
            },
            {
                name: "host",
                control: {
                    type: "text",
                    defaultValue: "http://localhost:11434",
                    config: {
                        label: "host",
                    },
                },
            },
            {
                name: "keepAlive",
                control: {
                    type: "number",
                    defaultValue: -1,
                    config: {
                        label: "keep_alive",
                        min: -1,
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getControlsWithOverride(nodeId, inputs);

            const prompt = (inputs["prompt"] ?? [])[0];

            if (!prompt?.length) {
                throw new Error("Prompt is empty");
            }

            const model = ((controls.model as string) || "").trim();

            if (!model.length) {
                throw new Error("Model is missing");
            }

            const ollama = new Ollama({
                host: (controls.host as string | undefined) || undefined,
            });

            const embResult = await ollama.embeddings({
                model,
                prompt,
                keep_alive: controls.keepAlive as number,
                options: {
                    mirostat: Number.parseInt(controls.mirostat as string),
                    mirostat_eta: controls.mirostatEta as number,
                    mirostat_tau: controls.mirostatTau as number,
                    num_ctx: controls.numCtx as number,
                    repeat_last_n: controls.repeatLastN as number,
                    repeat_penalty: controls.repeatPenalty as number,
                    temperature: controls.temperature as number,
                    seed: (controls.seed as number | null) ?? undefined,
                    stop: controls.stop
                        ? (controls.stop as string)
                              .split(",")
                              .map((s) => s.trim())
                        : undefined,
                    tfs_z: controls.tfsZ as number,
                    num_predict: controls.numPredict as number,
                    top_k: controls.topK as number,
                    top_p: controls.topP as number,
                },
            });

            return {
                result: JSON.stringify(embResult.embedding),
            };
        },
    }
);

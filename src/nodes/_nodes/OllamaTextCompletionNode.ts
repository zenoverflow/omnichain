import { Ollama } from "ollama";

import type { ChatMessageFile } from "../../data/types";

import { makeNode } from "./_Base";

const doc = [
    "Generate text using Ollama's basic completion API (/api/generate).",
    "Set raw to true if you want to bypass ollama's templating and",
    "pass in a full templated prompt,",
    "(made with the TemplateBuilder node, for example).",
    "This node supports images as file inputs.",
    "Non-image files will be filtered out by mime type.",
    "If both a single image and an array of images are passed in,",
    "the single image will be appended to the array.",
    "The API key name property is used to reference an API key set via",
    "the API key management dialog from the top bar.",
    "Note that you can unload a model by setting keep_alive to 0.",
]
    .join(" ")
    .trim();

export const OllamaTextCompletionNode = makeNode(
    {
        nodeName: "OllamaTextCompletionNode",
        nodeIcon: "LaptopOutlined",
        dimensions: [620, 1130],
        doc,
    },
    {
        inputs: [
            {
                //
                name: "system",
                type: "string",
                label: "system message",
            },
            {
                //
                name: "prompt",
                type: "string",
            },
            {
                //
                name: "images",
                type: "fileArray",
                label: "images (array)",
            },
            {
                //
                name: "image",
                type: "file",
                label: "image (single)",
            },
        ],
        outputs: [{ name: "result", type: "string" }],
        controls: [
            {
                name: "model",
                control: {
                    type: "text",
                    defaultValue: "llama3",
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
                    defaultValue: 1.0,
                    config: {
                        label: "top_k",
                        min: 0.01,
                        max: 1.0,
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
            {
                name: "json",
                control: {
                    type: "select",
                    defaultValue: "false",
                    config: {
                        label: "json",
                        values: [
                            { value: "true", label: "true" },
                            { value: "false", label: "false" },
                        ],
                    },
                },
            },
            {
                name: "raw",
                control: {
                    type: "select",
                    defaultValue: "false",
                    config: {
                        label: "raw",
                        values: [
                            { value: "true", label: "true" },
                            { value: "false", label: "false" },
                        ],
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getAllControls(nodeId);

            const prompt = (inputs["prompt"] ?? [])[0];

            if (!prompt?.length) {
                throw new Error("OllamaTextCompletionNode: prompt is empty");
            }

            const model = ((controls.model as string) || "").trim();

            if (!model.length) {
                throw new Error("OllamaTextCompletionNode: model is missing");
            }

            const images: ChatMessageFile[] = (inputs["images"] || [])[0] || [];
            const image = (inputs["image"] || [])[0];
            if (image) {
                images.push(image);
            }

            const ollama = new Ollama({
                host: (controls.host as string | undefined) || undefined,
            });

            const textCompletion = await ollama.generate({
                model,
                prompt,
                images: images.length
                    ? images
                          .filter((i) => i.mimetype.startsWith("image/"))
                          .map((i) => i.content)
                    : undefined,
                system: (inputs["system"] || [])[0] || undefined,
                stream: false,
                keep_alive: controls.keepAlive as number,
                format:
                    (controls.json as string) === "true" ? "json" : undefined,
                options: {
                    mirostat: Number.parseInt(controls.mirostat as string),
                    mirostat_eta: controls.mirostatEta as number,
                    mirostat_tau: controls.mirostatTau as number,
                    num_ctx: controls.numCtx as number,
                    repeat_last_n: controls.repeatLastN as number,
                    repeat_penalty: controls.repeatPenalty as number,
                    temperature: controls.temperature as number,
                    seed: controls.seed ? (controls.seed as number) : undefined,
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
                raw: (controls.raw as string) === "true",
            });

            return {
                result: textCompletion.response,
            };
        },
    }
);

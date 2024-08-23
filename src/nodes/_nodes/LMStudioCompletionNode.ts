import axios from "axios";

import { makeNode } from "./_Base";

const doc = [
    "Generate text using LMStudio's completions API (/v1/completions).",
    "This node can be used with a custom url by setting the",
    "base url property. Leaving the base url property",
    "empty will default to the regular LMStudio API url.",
]
    .join(" ")
    .trim();

export const LMStudioCompletionNode = makeNode(
    {
        nodeName: "LMStudioCompletionNode",
        nodeIcon: "OpenAIOutlined",
        dimensions: [620, 730],
        doc,
    },
    {
        inputs: [{ name: "prompt", type: "string" }],
        outputs: [{ name: "result", type: "string" }],

        // includes all controls
        // keys are display names in snake_case
        // values are the real control names
        controlsOverride: {
            model: "model",
            max_tokens: "maxTokens",
            temperature: "temperature",
            top_p: "topP",
            top_k: "topK",
            frequency_penalty: "frequencyPenalty",
            presence_penalty: "presencePenalty",
            repeat_penalty: "repeatPenalty",
            stop: "stop",
            seed: "seed",
            base_url: "baseUrl",
        },
        controls: [
            {
                name: "model",
                control: {
                    type: "text",
                    defaultValue: "gpt-3.5-turbo-instruct",
                    config: {
                        label: "model",
                    },
                },
            },
            {
                name: "maxTokens",
                control: {
                    type: "number",
                    defaultValue: 120,
                    config: {
                        label: "max_tokens",
                        min: -1,
                    },
                },
            },
            {
                name: "temperature",
                control: {
                    type: "number",
                    defaultValue: 1.0,
                    config: {
                        label: "temperature",
                        min: 0,
                        max: 2.0,
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
                name: "frequencyPenalty",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "frequency_penalty",
                        min: -2.0,
                        max: 2.0,
                    },
                },
            },
            {
                name: "presencePenalty",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "presence_penalty",
                        min: -2.0,
                        max: 2.0,
                    },
                },
            },
            {
                name: "repeatPenalty",
                control: {
                    type: "number",
                    defaultValue: 1.15,
                    config: {
                        label: "repeat_penalty",
                        min: 1.0,
                        max: 1.5,
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
                name: "baseUrl",
                control: {
                    type: "text",
                    defaultValue: "http://localhost:1234",
                    config: {
                        label: "base_url",
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
                throw new Error("Missing prompt.");
            }

            const baseUrl = (
                (controls.baseUrl as string) || "http://localhost:1234"
            ).trim();

            const model = ((controls.model as string) || "").trim();

            const response = await axios.post(
                `${baseUrl}/v1/completions`,
                {
                    model,
                    prompt,
                    max_tokens: controls.maxTokens as number,
                    temperature: controls.temperature as number,
                    top_p: controls.topP as number,
                    top_k: controls.topK as number,
                    frequency_penalty: controls.frequencyPenalty as number,
                    presence_penalty: controls.presencePenalty as number,
                    repeat_penalty: controls.repeatPenalty as number,
                    seed: (controls.seed as number | null) ?? undefined,
                    stop: controls.stop
                        ? (controls.stop as string)
                              .split(",")
                              .map((s) => s.trim())
                        : undefined,
                    stream: false,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const textCompletion = response.data;

            return {
                result: textCompletion.choices[0].text,
            };
        },
    }
);

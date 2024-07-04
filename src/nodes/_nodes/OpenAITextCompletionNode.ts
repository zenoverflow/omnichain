import { makeNode } from "./_Base";

const doc = [
    "Generate text using OpenAI's basic completions API (/v1/completions).",
    "This node can be used with a custom backend by setting the",
    "base url property. Leaving the base url property",
    "empty will default to the official OpenAI API.",
    "The API key name property is used to reference an API key set via",
    "the API key management dialog from the top bar.",
]
    .join(" ")
    .trim();

export const OpenAITextCompletionNode = makeNode(
    {
        nodeName: "OpenAITextCompletionNode",
        nodeIcon: "OpenAIOutlined",
        dimensions: [620, 730],
        doc,
    },
    {
        inputs: [{ name: "prompt", type: "string" }],
        outputs: [{ name: "results", type: "stringArray" }],
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
                        min: 1,
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
                name: "numResponses",
                control: {
                    type: "number",
                    defaultValue: 1,
                    config: {
                        label: "num_responses",
                        min: 1,
                    },
                },
            },
            {
                name: "echo",
                control: {
                    type: "select",
                    defaultValue: "false",
                    config: {
                        label: "echo",
                        values: [
                            { value: "true", label: "true" },
                            { value: "false", label: "false" },
                        ],
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
                name: "apiKeyName",
                control: {
                    type: "text",
                    defaultValue: "",
                    config: {
                        label: "API key name",
                    },
                },
            },
            {
                name: "baseUrl",
                control: {
                    type: "text",
                    defaultValue: "https://api.openai.com",
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
            const controls = context.getAllControls(nodeId);

            const prompt = (inputs["prompt"] ?? [])[0];

            if (!prompt?.length) {
                throw new Error("Missing prompt.");
            }

            const apiKeyName = ((controls.apiKeyName as string) || "").trim();

            const apiKey = context.getApiKeyByName(apiKeyName) || "empty";

            const baseUrl = (
                (controls.baseUrl as string) || "https://api.openai.com"
            ).trim();

            const model = ((controls.model as string) || "").trim();

            const response = await fetch(`${baseUrl}/v1/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    prompt,
                    max_tokens: controls.maxTokens as number,
                    temperature: controls.temperature as number,
                    top_p: controls.topP as number,
                    frequency_penalty: controls.frequencyPenalty as number,
                    presence_penalty: controls.presencePenalty as number,
                    n: controls.numResponses as number,
                    echo: controls.echo === "true",
                    seed: (controls.seed as number | null) ?? undefined,
                    stop: controls.stop
                        ? (controls.stop as string)
                              .split(",")
                              .map((s) => s.trim())
                        : undefined,
                    stream: false,
                }),
            });

            const textCompletion = await response.json();

            return {
                results: textCompletion.choices.map(
                    (choice: any) => choice.text as string
                ),
            };
        },
    }
);

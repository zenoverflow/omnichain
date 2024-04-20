import { makeNode } from "./_Base";

export const OpenAIPrompterNode = makeNode(
    {
        nodeName: "OpenAIPrompterNode",
        nodeIcon: "OpenAIOutlined",
        dimensions: [380, 570],
        doc: "Generate text using OpenAI's basic completions API (/v1/completions).",
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
                name: "seed",
                control: {
                    type: "number",
                    defaultValue: null,
                    config: {
                        label: "seed",
                    },
                },
            },
        ],
    },
    {
        dataFlow: {
            inputs: ["prompt"],
            outputs: ["results"],
            async logic(_node, _context, _controls, _fetchInputs) {
                return {};
            },
        },
    }
);

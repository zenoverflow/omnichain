import { makeNode } from "./_Base";

const doc = [
    "Generate text using TextGenWebUI's completions API.",
    "You can adjust for a different endpoint host by setting the base url property.",
]
    .join(" ")
    .trim();

export const TextGenWebUICompletionNode = makeNode(
    {
        nodeName: "TextGenWebUICompletionNode",
        nodeIcon: "OpenAIOutlined",
        dimensions: [630, 2420],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "prompt",
                type: "string",
                label: "prompt",
            },
            {
                name: "negativePrompt",
                type: "string",
                label: "negative prompt",
            },
            {
                name: "grammarString",
                type: "string",
                label: "grammar (string)",
            },
        ],
        outputs: [
            //
            { name: "results", type: "stringArray" },
        ],
        controls: [
            {
                name: "max_new_tokens",
                control: {
                    type: "number",
                    defaultValue: 512,
                    config: {
                        label: "max_new_tokens",
                        min: 1,
                        // max: 4096,
                    },
                },
            },
            {
                name: "temperature",
                control: {
                    type: "number",
                    defaultValue: 0.7,
                    config: {
                        label: "temperature",
                        min: 0.01,
                        max: 5,
                    },
                },
            },
            {
                name: "top_p",
                control: {
                    type: "number",
                    defaultValue: 0.9,
                    config: {
                        label: "top_p",
                        min: 0.0,
                        max: 1.0,
                    },
                },
            },
            {
                name: "top_k",
                control: {
                    type: "number",
                    defaultValue: 20,
                    config: {
                        label: "top_k",
                        min: 0,
                        max: 200,
                    },
                },
            },
            {
                name: "typical_p",
                control: {
                    type: "number",
                    defaultValue: 1.0,
                    config: {
                        label: "typical_p",
                        min: 0.0,
                        max: 1.0,
                    },
                },
            },
            {
                name: "min_p",
                control: {
                    type: "number",
                    defaultValue: 0.0,
                    config: {
                        label: "min_p",
                        min: 0.0,
                        max: 1.0,
                    },
                },
            },
            {
                name: "repetition_penalty",
                control: {
                    type: "number",
                    defaultValue: 1.15,
                    config: {
                        label: "repetition_penalty",
                        min: 1.0,
                        max: 1.5,
                    },
                },
            },
            {
                name: "frequency_penalty",
                control: {
                    type: "number",
                    defaultValue: 0.0,
                    config: {
                        label: "frequency_penalty",
                        min: 0,
                        max: 2,
                    },
                },
            },
            {
                name: "presence_penalty",
                control: {
                    type: "number",
                    defaultValue: 0.0,
                    config: {
                        label: "presence_penalty",
                        min: 0,
                        max: 2,
                    },
                },
            },
            {
                name: "repetition_penalty_range",
                control: {
                    type: "number",
                    defaultValue: 1024,
                    config: {
                        label: "repetition_penalty_range",
                        min: 0,
                        max: 4096,
                    },
                },
            },
            {
                name: "do_sample",
                control: {
                    type: "select",
                    defaultValue: "true",
                    config: {
                        label: "do_sample",
                        values: [
                            { value: "true", label: "true" },
                            { value: "false", label: "false" },
                        ],
                    },
                },
            },
            {
                name: "dry_multiplier",
                control: {
                    type: "number",
                    defaultValue: 0.0,
                    config: {
                        label: "dry_multiplier",
                        min: 0,
                        max: 5,
                    },
                },
            },
            {
                name: "dry_base",
                control: {
                    type: "number",
                    defaultValue: 1.75,
                    config: {
                        label: "dry_base",
                        min: 1,
                        max: 4,
                    },
                },
            },
            {
                name: "dry_allowed_length",
                control: {
                    type: "number",
                    defaultValue: 2,
                    config: {
                        label: "dry_allowed_length",
                        min: 1,
                        max: 20,
                    },
                },
            },
            {
                name: "dry_sequence_breakers",
                control: {
                    type: "text",
                    defaultValue: `"\n", ":", "\\"", "*"`,
                    config: {
                        label: "dry_sequence_breakers",
                    },
                },
            },
            {
                name: "auto_max_new_tokens",
                control: {
                    type: "select",
                    defaultValue: "false",
                    config: {
                        label: "auto_max_new_tokens",
                        values: [
                            { value: "true", label: "true" },
                            { value: "false", label: "false" },
                        ],
                    },
                },
            },
            {
                name: "ban_eos_token",
                control: {
                    type: "select",
                    defaultValue: "false",
                    config: {
                        label: "ban_eos_token",
                        values: [
                            { value: "true", label: "true" },
                            { value: "false", label: "false" },
                        ],
                    },
                },
            },
            {
                name: "add_bos_token",
                control: {
                    type: "select",
                    defaultValue: "true",
                    config: {
                        label: "add_bos_token",
                        values: [
                            { value: "true", label: "true" },
                            { value: "false", label: "false" },
                        ],
                    },
                },
            },
            {
                name: "custom_stopping_strings",
                control: {
                    type: "text",
                    defaultValue: "",
                    config: {
                        label: "custom_stopping_strings",
                    },
                },
            },
            {
                name: "custom_token_bans",
                control: {
                    type: "text",
                    defaultValue: "",
                    config: {
                        label: "custom_token_bans",
                    },
                },
            },
            {
                name: "penalty_alpha",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "penalty_alpha",
                        min: 0,
                        max: 5,
                    },
                },
            },
            {
                name: "guidance_scale",
                control: {
                    type: "number",
                    defaultValue: 1,
                    config: {
                        label: "guidance_scale",
                        min: -0.5,
                        max: 2.5,
                    },
                },
            },
            // used as input instead, left for reference
            // {
            //     name: "negative_prompt",
            //     control: {
            //         type: "text",
            //         defaultValue: "",
            //         config: {
            //             label: "Negative prompt",
            //         },
            //     },
            // },
            {
                name: "mirostat_mode",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "mirostat_mode",
                        min: 0,
                        max: 2,
                    },
                },
            },
            {
                name: "mirostat_tau",
                control: {
                    type: "number",
                    defaultValue: 5,
                    config: {
                        label: "mirostat_tau",
                        min: 0,
                        max: 10,
                    },
                },
            },
            {
                name: "mirostat_eta",
                control: {
                    type: "number",
                    defaultValue: 0.1,
                    config: {
                        label: "mirostat_eta",
                        min: 0,
                        max: 1,
                    },
                },
            },
            {
                name: "epsilon_cutoff",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "epsilon_cutoff",
                        min: 0,
                        max: 9,
                    },
                },
            },
            {
                name: "eta_cutoff",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "eta_cutoff",
                        min: 0,
                        max: 20,
                    },
                },
            },
            {
                name: "encoder_repetition_penalty",
                control: {
                    type: "number",
                    defaultValue: 1,
                    config: {
                        label: "encoder_repetition_penalty",
                        min: 0.8,
                        max: 1.5,
                    },
                },
            },
            {
                name: "no_repeat_ngram_size",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "no_repeat_ngram_size",
                        min: 0,
                        max: 20,
                    },
                },
            },
            // used as input instead, left for reference
            // {
            //     name: "grammar_string",
            //     control: {
            //         type: "text",
            //         defaultValue: "",
            //         config: {
            //             label: "Grammar",
            //         },
            //     },
            // },
            {
                name: "tfs",
                control: {
                    type: "number",
                    defaultValue: 1,
                    config: {
                        label: "tfs",
                        min: 0.0,
                        max: 1.0,
                    },
                },
            },
            {
                name: "top_a",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "top_a",
                        min: 0.0,
                        max: 1.0,
                    },
                },
            },
            {
                name: "smoothing_factor",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "smoothing_factor",
                        min: 0.0,
                        max: 10.0,
                    },
                },
            },
            {
                name: "smoothing_curve",
                control: {
                    type: "number",
                    defaultValue: 1,
                    config: {
                        label: "smoothing_curve",
                        min: 1.0,
                        max: 10.0,
                    },
                },
            },
            {
                name: "dynamic_temperature",
                control: {
                    type: "select",
                    defaultValue: "false",
                    config: {
                        label: "dynamic_temperature",
                        values: [
                            { value: "true", label: "true" },
                            { value: "false", label: "false" },
                        ],
                    },
                },
            },
            {
                name: "dynatemp_low",
                control: {
                    type: "number",
                    defaultValue: 1,
                    config: {
                        label: "dynatemp_low",
                        min: 0.01,
                        max: 5,
                    },
                },
            },
            {
                name: "dynatemp_high",
                control: {
                    type: "number",
                    defaultValue: 1,
                    config: {
                        label: "dynatemp_high",
                        min: 0.01,
                        max: 5,
                    },
                },
            },
            {
                name: "dynatemp_exponent",
                control: {
                    type: "number",
                    defaultValue: 1,
                    config: {
                        label: "dynatemp_exponent",
                        min: 0.01,
                        max: 5,
                    },
                },
            },
            {
                name: "temperature_last",
                control: {
                    type: "select",
                    defaultValue: "false",
                    config: {
                        label: "temperature_last",
                        values: [
                            { value: "true", label: "true" },
                            { value: "false", label: "false" },
                        ],
                    },
                },
            },
            {
                name: "sampler_priority",
                control: {
                    type: "text",
                    defaultValue:
                        "temperature, dynamic_temperature, quadratic_sampling, top_k, top_p, typical_p, epsilon_cutoff, eta_cutoff, tfs, top_a, min_p, mirostat",
                    config: {
                        label: "Sampler priority",
                    },
                },
            },
            {
                name: "truncation_length",
                control: {
                    type: "number",
                    defaultValue: 2048,
                    config: {
                        label: "truncation_length",
                        min: 1,
                    },
                },
            },
            {
                name: "prompt_lookup_num_tokens",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "prompt_lookup_num_tokens",
                        min: 0,
                        max: 10,
                    },
                },
            },
            // for gradio ui only, kept for reference
            // {
            //     name: "max_tokens_second",
            //     control: {
            //         type: "number",
            //         defaultValue: 0,
            //         config: {
            //             label: "max_tokens_second",
            //             min: 0,
            //             max: 20,
            //         },
            //     },
            // },
            // {
            //     name: "max_updates_second",
            //     control: {
            //         type: "number",
            //         defaultValue: 0,
            //         config: {
            //             label: "max_updates_second",
            //             min: 0,
            //             max: 24,
            //         },
            //     },
            // },
            {
                name: "seed",
                control: {
                    type: "number",
                    defaultValue: -1,
                    config: {
                        label: "seed (-1 for random)",
                    },
                },
            },
            {
                name: "skip_special_tokens",
                control: {
                    type: "select",
                    defaultValue: "true",
                    config: {
                        label: "Skip special tokens",
                        values: [
                            { value: "true", label: "true" },
                            { value: "false", label: "false" },
                        ],
                    },
                },
            },
            // not supported, kept for reference
            // {
            //     name: "stream",
            //     control: {
            //         type: "select",
            //         defaultValue: "true",
            //         config: {
            //             label: "Activate text streaming",
            //             values: [
            //                 { value: "true", label: "true" },
            //                 { value: "false", label: "false" },
            //             ],
            //         },
            //     },
            // },
            {
                name: "n",
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
                name: "baseUrl",
                control: {
                    type: "text",
                    defaultValue: "http://localhost:5000",
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
            const negativePrompt = (inputs["negativePrompt"] ?? [])[0] || "";
            const grammarString = (inputs["grammarString"] ?? [])[0] || "";

            if (!prompt?.length) {
                throw new Error("Missing prompt.");
            }

            const baseUrl = (
                (controls.baseUrl as string) || "http://localhost:5000"
            ).trim();

            // console.log("---");
            // console.log(prompt);
            // console.log("---");

            // eslint-disable-next-line no-useless-catch
            try {
                const response = await fetch(`${baseUrl}/v1/completions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        // all parameters from controls
                        ...controls,

                        // selects with true/false values are converted to booleans like `controls.do_sample === "true"`
                        do_sample: controls.do_sample === "true",
                        auto_max_new_tokens:
                            controls.auto_max_new_tokens === "true",
                        ban_eos_token: controls.ban_eos_token === "true",
                        add_bos_token: controls.add_bos_token === "true",
                        dynamic_temperature:
                            controls.dynamic_temperature === "true",
                        temperature_last: controls.temperature_last === "true",
                        skip_special_tokens:
                            controls.skip_special_tokens === "true",
                        // stream: controls.stream === "true",

                        // finally, add the prompt, negative prompt and grammar string
                        prompt,
                        negative_prompt: negativePrompt,
                        grammar_string: grammarString,

                        // fix max tokens bug
                        max_tokens: controls.max_new_tokens,
                    }),
                });

                const textCompletion = await response.json();

                return {
                    results: textCompletion.choices.map(
                        (choice: any) => choice.text as string
                    ),
                };
            } catch (error) {
                console.error(JSON.stringify(error, null, 2));
                throw error;
            }
        },
    }
);

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
        dimensions: [630, 2460],
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

        // includes all controls
        // keys are display names in snake_case
        // values are the real control names
        controlsOverride: {
            max_new_tokens: "max_new_tokens",
            temperature: "temperature",
            top_p: "top_p",
            top_k: "top_k",
            typical_p: "typical_p",
            min_p: "min_p",
            repetition_penalty: "repetition_penalty",
            frequency_penalty: "frequency_penalty",
            presence_penalty: "presence_penalty",
            repetition_penalty_range: "repetition_penalty_range",
            do_sample: "do_sample",
            dry_multiplier: "dry_multiplier",
            dry_base: "dry_base",
            dry_allowed_length: "dry_allowed_length",
            dry_sequence_breakers: "dry_sequence_breakers",
            auto_max_new_tokens: "auto_max_new_tokens",
            ban_eos_token: "ban_eos_token",
            add_bos_token: "add_bos_token",
            custom_stopping_strings: "custom_stopping_strings",
            custom_token_bans: "custom_token_bans",
            penalty_alpha: "penalty_alpha",
            guidance_scale: "guidance_scale",
            mirostat_mode: "mirostat_mode",
            mirostat_tau: "mirostat_tau",
            mirostat_eta: "mirostat_eta",
            epsilon_cutoff: "epsilon_cutoff",
            eta_cutoff: "eta_cutoff",
            encoder_repetition_penalty: "encoder_repetition_penalty",
            no_repeat_ngram_size: "no_repeat_ngram_size",
            tfs: "tfs",
            top_a: "top_a",
            smoothing_factor: "smoothing_factor",
            smoothing_curve: "smoothing_curve",
            dynamic_temperature: "dynamic_temperature",
            dynatemp_low: "dynatemp_low",
            dynatemp_high: "dynatemp_high",
            dynatemp_exponent: "dynatemp_exponent",
            temperature_last: "temperature_last",
            sampler_priority: "sampler_priority",
            truncation_length: "truncation_length",
            prompt_lookup_num_tokens: "prompt_lookup_num_tokens",
            seed: "seed",
            skip_special_tokens: "skip_special_tokens",
            num_responses: "n",
            base_url: "baseUrl",
        },
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
            const controls = context.getControlsWithOverride(nodeId, inputs);

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

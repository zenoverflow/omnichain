import { makeNode } from "./_Base";

const doc = [
    "Generate embeddings for a vector DB using TextGenWebUI's API.",
    "You can adjust for a different endpoint host by setting the base url property.",
    "The node can be used to generate embeddings for a single text or an array of texts.",
    "If both inputs are provided, the single text input will be appended to the array of texts.",
    "Results will always be returned as an array of JSON-encoded strings which contain",
    "the embeddings (number arrays) for the input text(s).",
]
    .join(" ")
    .trim();

export const TextGenWebUIEmbeddingsNode = makeNode(
    {
        nodeName: "TextGenWebUIEmbeddingsNode",
        nodeIcon: "OpenAIOutlined",
        dimensions: [620, 260],
        doc,
    },
    {
        inputs: [
            //
            { name: "textSingle", type: "string", label: "text (single)" },
            { name: "textArray", type: "stringArray", label: "texts (array)" },
        ],
        outputs: [
            //
            { name: "results", type: "stringArray" },
        ],

        controlsOverride: {
            base_url: "baseUrl",
        },
        controls: [
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

            const textsToEmbed = (inputs.textArray || [])[0] || [];
            const textSingle = (inputs.textSingle || [])[0];

            if (textSingle) {
                textsToEmbed.push(textSingle);
            }

            if (!textsToEmbed?.length) {
                throw new Error("No text to embed!");
            }

            // const apiKeyName = ((controls.apiKeyName as string) || "").trim();
            // const apiKey = context.getApiKeyByName(apiKeyName) || "empty";

            const baseUrl = (
                (controls.baseUrl as string) || "http://localhost:5000"
            ).trim();

            // const model = ((controls.model as string) || "").trim();

            const response = await fetch(`${baseUrl}/v1/embeddings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "",
                    input: textsToEmbed,
                    // encoding_format: controls.format,
                    // dimensions: controls.dimensions,
                }),
            });

            const embeddingsData = await response.json();

            return {
                results: embeddingsData.data.map((embObj: any) =>
                    JSON.stringify(embObj.embedding)
                ),
            };
        },
    }
);

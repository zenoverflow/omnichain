import OpenAI from "openai";

import { makeNode } from "./_Base";
import { ChatMessage } from "../../data/types";

const doc = [
    "Get responses using OpenAI's chat completions API (/v1/chat/completions).",
    "Images are also supported as part of the message content with vision set to true.",
    "Note that local OAI-compatible backends do not support images, so",
    "the node will throw an error if vision is enabled.",
    "Non-image files will be filtered out by mime type.",
    "This node can be used with a custom backend by setting the",
    "base url property. Leaving the base url property",
    "empty will default to the official OpenAI API.",
    "The API key name property is used to reference an API key set via",
    "the API key management dialog from the top bar.",
    "Messages can be passed in as a single message or an array of messages.",
    "If both a single message and an array of messages are passed in,",
    "the single message will be appended to the array.",
]
    .join(" ")
    .trim();

export const OpenAIChatCompletionNode = makeNode(
    {
        nodeName: "OpenAIChatCompletionNode",
        nodeIcon: "OpenAIOutlined",
        dimensions: [620, 770],
        doc,
    },
    {
        inputs: [
            {
                //
                name: "messages",
                type: "chatMessageArray",
                label: "messages (array)",
            },
            {
                //
                name: "message",
                type: "chatMessage",
                label: "message (single)",
            },
        ],
        outputs: [{ name: "results", type: "stringArray" }],
        controls: [
            {
                name: "model",
                control: {
                    type: "text",
                    defaultValue: "gpt-4-turbo",
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
            // {
            //     name: "echo",
            //     control: {
            //         type: "select",
            //         defaultValue: "false",
            //         config: {
            //             label: "echo",
            //             values: [
            //                 { value: "true", label: "true" },
            //                 { value: "false", label: "false" },
            //             ],
            //         },
            //     },
            // },
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
                    defaultValue: "",
                    config: {
                        label: "base_url",
                    },
                },
            },
            {
                name: "vision",
                control: {
                    type: "select",
                    defaultValue: "false",
                    config: {
                        label: "vision",
                        values: [
                            { value: "false", label: "false" },
                            { value: "true", label: "true" },
                        ],
                    },
                },
            },
        ],
    },
    {
        dataFlow: {
            inputs: ["messages", "message"],
            outputs: ["results"],
            async logic(_node, context, controls, fetchInputs) {
                const inputs = await fetchInputs();
                // const prompt = (inputs["prompt"] ?? [])[0];
                const messages: ChatMessage[] = [
                    ...((inputs["messages"] ?? [])[0] || []),
                ];
                const messageSingle = (inputs["message"] ?? [])[0];
                if (messageSingle) {
                    messages.push(messageSingle);
                }

                if (!messages.length) {
                    throw new Error(
                        "OpenAIChatCompletionNode: No messages attached"
                    );
                }

                const apiKeyName = (
                    (controls.apiKeyName as string) || ""
                ).trim();
                const apiKey = context.getApiKeyByName(apiKeyName);

                let baseUrl = ((controls.baseUrl as string) || "").trim();
                if (baseUrl.length) {
                    if (!baseUrl.endsWith("/")) {
                        baseUrl += "/";
                    }
                    baseUrl += "v1";
                }

                const model = ((controls.model as string) || "").trim();

                const openAi = new OpenAI({
                    apiKey: apiKey || undefined,
                    baseURL: baseUrl || undefined,
                });

                const chatCompletion = await openAi.chat.completions.create(
                    {
                        model,
                        messages: messages.map((message) => ({
                            role: "user",
                            content:
                                controls.vision === "true"
                                    ? [
                                          {
                                              type: "text",
                                              text: message.content,
                                          },
                                          ...message.files
                                              .filter((file) =>
                                                  file.mimetype.startsWith(
                                                      "image/"
                                                  )
                                              )
                                              .map((file) => ({
                                                  type: "image_url",
                                                  image_url: {
                                                      url: `data:${file.mimetype};base64,${file.content}`,
                                                  },
                                              })),
                                      ]
                                    : message.content,
                        })) as any[],
                        max_tokens: controls.maxTokens as number,
                        temperature: controls.temperature as number,
                        top_p: controls.topP as number,
                        frequency_penalty: controls.frequencyPenalty as number,
                        presence_penalty: controls.presencePenalty as number,
                        n: controls.numResponses as number,
                        // echo: controls.echo === "true",
                        seed: controls.seed as number,
                        stop: controls.stop
                            ? (controls.stop as string)
                                  .split(",")
                                  .map((s) => s.trim())
                            : undefined,
                    },
                    {
                        stream: false,
                    }
                );

                return {
                    results: chatCompletion.choices.map(
                        (choice) => choice.message.content
                    ),
                };
            },
        },
    }
);

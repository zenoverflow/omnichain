import Koa from "koa";
import Router from "koa-router";
import { koaBody } from "koa-body";
import { v4 as uuid } from "uuid";
import mime from "mime-types";

import { ChatMessage } from "../src/data/types.ts";
import { MsgUtils } from "../src/util/MsgUtils.ts";

const appOpenAi = new Koa();
const routerOpenAi = new Router();

/**
 * Set up the OpenAI-compatible API.
 *
 * Runs on a separate port, to allow easy forwarding
 * separately from the main app for special use-cases.
 *
 * @param port
 * @param onMessage
 */
export const setupOpenAiCompatibleAPI = (
    port: number,
    onMessage: (
        message: ChatMessage,
        checkRequestActive: () => boolean
    ) => Promise<ChatMessage | null>
) => {
    routerOpenAi.post("/v1/completions", async (ctx) => {
        try {
            const { model, prompt } = ctx.request.body;

            let requestActive = true;
            ctx.req.on("close", () => {
                requestActive = false;
            });
            const result = await onMessage(
                MsgUtils.freshFromUser(model, prompt, null, []),
                () => requestActive
            );
            ctx.body = JSON.stringify({
                id: uuid(),
                object: "text_completion",
                created: result?.created ?? Date.now(),
                model: result?.chainId ?? model,
                system_fingerprint: "",
                choices: [
                    {
                        text: result?.content ?? "",
                        index: 0,
                        logprobs: null,
                        finish_reason: "stop",
                    },
                ],
                usage: {
                    prompt_tokens: 0,
                    completion_tokens: 0,
                    total_tokens: 0,
                },
            });
        } catch (error) {
            console.error(error);
            ctx.status = 400;
        }
    });

    routerOpenAi.post("/v1/chat/completions", async (ctx) => {
        try {
            const { model, messages } = ctx.request.body;

            let prompt = "";
            const files: ChatMessage["files"] = [];

            for (const message of messages) {
                const content: string = message.content || "";

                if (Array.isArray(content)) {
                    for (const subContent of content.filter((c) => !!c)) {
                        if (subContent.type === "image_url") {
                            const dataRegex = /^data:(.+?\/.+?);base64,(.+)/;

                            const data = subContent.image_url?.url as
                                | string
                                | null;
                            if (!data || !dataRegex.test(data)) continue;

                            const matches = data.match(dataRegex);
                            if (!matches || matches.length !== 2) continue;

                            const extension = mime.extension(matches[1]);
                            if (!extension) continue;

                            files.push({
                                name: `${uuid()}.${extension}`,
                                mimetype: matches[1],
                                content: matches[2],
                            });
                        } else {
                            prompt += `${subContent.text as string}\n\n`;
                        }
                    }
                } else {
                    prompt += `${content}\n\n`;
                }
            }

            let requestActive = true;
            ctx.req.on("close", () => {
                requestActive = false;
            });
            const result = await onMessage(
                MsgUtils.freshFromUser(model, prompt, null, files),
                () => requestActive
            );

            ctx.body = JSON.stringify({
                id: uuid(),
                object: "chat.completion",
                created: result?.created ?? Date.now(),
                model: result?.chainId ?? model,
                system_fingerprint: "",
                choices: [
                    {
                        index: 0,
                        message: {
                            role: "assistant",
                            text: result?.content ?? "",
                        },
                        logprobs: null,
                        finish_reason: "stop",
                    },
                ],
                usage: {
                    prompt_tokens: 0,
                    completion_tokens: 0,
                    total_tokens: 0,
                },
            });
        } catch (error) {
            console.error(error);
            ctx.status = 400;
        }
    });

    // Set up the server itself
    appOpenAi
        // body parsing
        .use(koaBody({ jsonLimit: "10240gb" }))
        // routing
        .use(routerOpenAi.routes())
        .use(routerOpenAi.allowedMethods());

    appOpenAi.listen(port, () => {
        console.log(
            `OpenAI-compatible API started on http://localhost:${port}`
        );
    });
};

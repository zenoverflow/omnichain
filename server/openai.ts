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
        messages: ChatMessage[],
        checkRequestActive: () => boolean,
        clearSessionOnResponse?: boolean
    ) => Promise<ChatMessage | null>
) => {
    routerOpenAi.post("/v1/completions", async (ctx) => {
        try {
            const { model, prompt } = ctx.request.body;

            const clearSessionOnResponse =
                ctx.request.body._ocClearSession || true;

            let requestActive = true;
            ctx.req.on("close", () => {
                requestActive = false;
            });
            const result = await onMessage(
                [
                    //
                    MsgUtils.freshFromUser(model, prompt, null, []),
                ],
                () => requestActive,
                clearSessionOnResponse
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

            const clearSessionOnResponse =
                ctx.request.body._ocClearSession || true;

            const chatMessages: ChatMessage[] = [];

            for (const message of messages) {
                const content: string | any[] = message.content || "";

                const files: ChatMessage["files"] = [];
                let text = "";

                if (Array.isArray(content)) {
                    for (const subContent of content.filter((c) => !!c)) {
                        if (subContent.type === "image_url") {
                            const dataRegex = /^data:(.+?\/.+?);base64,(.+)/;

                            const data = subContent.image_url?.url as
                                | string
                                | null;
                            if (!data || !dataRegex.test(data)) continue;

                            const matches = data.match(dataRegex);
                            if (!matches || matches.length !== 3) continue;

                            const extension = mime.extension(matches[1]);
                            if (!extension) continue;

                            files.push({
                                name: `${uuid()}.${extension}`,
                                mimetype: matches[1],
                                content: matches[2],
                            });
                        } else {
                            text = subContent.text;
                        }
                    }
                    chatMessages.push(
                        message.role === "user"
                            ? MsgUtils.freshFromUser(model, text, null, files)
                            : MsgUtils.freshFromAssistant(
                                  model,
                                  text,
                                  null,
                                  files
                              )
                    );
                } else {
                    chatMessages.push(
                        message.role === "user"
                            ? MsgUtils.freshFromUser(model, content, null, [])
                            : MsgUtils.freshFromAssistant(
                                  model,
                                  content,
                                  null,
                                  []
                              )
                    );
                }
            }

            if (!chatMessages.length) throw new Error("No messages provided");

            let requestActive = true;
            ctx.req.on("close", () => {
                requestActive = false;
            });
            const result = await onMessage(
                chatMessages,
                () => requestActive,
                clearSessionOnResponse
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

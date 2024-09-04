import Router from "koa-router";
import path from "path";

import { callExternalModule } from "./external.ts";
import { readJsonFile } from "./utils.ts";
import { globalServerConfig } from "./config.ts";

/**
 * Set up the transcription endpoint for FasterWhisper.
 * Only works with the external Python module.
 *
 * @param port
 * @param onMessage
 */
export const setupTranscriptionAPI = (router: Router) => {
    router.post("/api/transcribe-force-load", async (ctx) => {
        try {
            let options: Record<string, any> = {};

            try {
                options = readJsonFile(
                    path.join(globalServerConfig.dirData, "options.json")
                );
            } catch (error) {
                // Ignore
            }

            const model =
                !options.model || options.model === "disabled"
                    ? "medium"
                    : options.model;

            const device = options.whisperDevice || "cpu";

            await callExternalModule("python", "/faster_whisper/load", {
                model,
                device,
                force_reload: true,
            });

            ctx.body = JSON.stringify({ success: true });
        } catch (error) {
            console.error(error);
            ctx.status = 400;
        }
    });

    router.post("/api/transcribe-unload", async (ctx) => {
        try {
            await callExternalModule("python", "/faster_whisper/unload", {});

            ctx.body = JSON.stringify({ success: true });
        } catch (error) {
            console.error(error);
            ctx.status = 400;
        }
    });

    router.post("/api/transcribe", async (ctx) => {
        try {
            const { audioRaw } = ctx.request.body;

            let options: Record<string, any> = {};

            try {
                options = readJsonFile(
                    path.join(globalServerConfig.dirData, "options.json")
                );
            } catch (error) {
                // Ignore
            }

            const model =
                !options.model || options.model === "disabled"
                    ? "medium"
                    : options.model;

            const device = options.whisperDevice || "cpu";

            const keepLoaded = options.whisperKeepLoaded === true;

            await callExternalModule("python", "/faster_whisper/load", {
                model,
                device,
                force_reload: false,
            });

            const result = JSON.stringify({
                result: await callExternalModule(
                    "python",
                    "/faster_whisper/action",
                    {
                        audio: audioRaw,
                    }
                ),
            });

            if (!keepLoaded) {
                await callExternalModule(
                    "python",
                    "/faster_whisper/unload",
                    {}
                );
            }

            ctx.body = result;
        } catch (error) {
            console.error(error);
            ctx.status = 400;
        }
    });
};

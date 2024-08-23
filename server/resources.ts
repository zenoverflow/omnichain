import path from "path";
import fs from "fs";

import type Router from "koa-router";

import { globalServerConfig } from "./config.ts";
import { readJsonFile, ensureDirExists, buildNodeRegistry } from "./utils.ts";

export const setupResourcesApi = (router: Router) => {
    const dirData = globalServerConfig.dirData;

    // API: node_registry (fetch only)

    router.get("/api/node_registry", (ctx) => {
        // Build a serializable node registry without flow functions
        ctx.body = JSON.stringify(
            buildNodeRegistry(globalServerConfig.dirCustomNodes, true)
        );
    });

    // API: single-file resources

    router.get("/api/resource/single/:resource", (ctx) => {
        const pathToFile = path.join(dirData, `${ctx.params.resource}.json`);
        if (!fs.existsSync(pathToFile)) {
            ctx.body = JSON.stringify({});
        } else {
            ctx.body = JSON.stringify(readJsonFile(pathToFile));
        }
    });

    router.post("/api/resource/single/:resource", async (ctx) => {
        await new Promise((resolve, reject) => {
            fs.writeFile(
                path.join(dirData, `${ctx.params.resource}.json`),
                JSON.stringify(ctx.request.body),
                (err) => {
                    if (err) reject(err);
                    else resolve(null);
                }
            );
        });
        ctx.body = "OK";
    });

    router.delete("/api/resource/single/:resource", (ctx) => {
        const pathToFile = path.join(dirData, `${ctx.params.resource}.json`);
        if (fs.existsSync(pathToFile)) fs.unlinkSync(pathToFile);
        ctx.body = "OK";
    });

    // API: multi-file resources

    router.get("/api/resource/multi/index/:resource", (ctx) => {
        const resourceDir = path.join(dirData, ctx.params.resource);
        ensureDirExists(resourceDir);

        const resourceFiles = fs.readdirSync(resourceDir);
        ctx.body = JSON.stringify(
            Object.fromEntries(
                resourceFiles.map((file) => {
                    const content = readJsonFile(
                        path.join(dirData, ctx.params.resource, file)
                    );
                    // Grab id from filename (strip out the extension, use regex)
                    const id = file.replace(/\.[^/.]+$/, "");
                    return [
                        id,
                        {
                            name: content.name ?? id,
                            created: content.created ?? Date.now(),
                        },
                    ];
                })
            )
        );
    });

    router.get("/api/resource/multi/all/:resource", (ctx) => {
        const resourceDir = path.join(dirData, ctx.params.resource);
        ensureDirExists(resourceDir);

        const resourceFiles = fs.readdirSync(resourceDir);
        ctx.body = JSON.stringify(
            Object.fromEntries(
                resourceFiles.map((file) => {
                    const content = readJsonFile(
                        path.join(dirData, ctx.params.resource, file)
                    );
                    // Grab id from filename (strip out the extension, use regex)
                    const id = file.replace(/\.[^/.]+$/, "");
                    return [id, content];
                })
            )
        );
    });

    router.get("/api/resource/multi/single/:resource/:id", (ctx) => {
        const resourceDir = path.join(dirData, ctx.params.resource);
        ensureDirExists(resourceDir);

        const pathToFile = path.join(resourceDir, `${ctx.params.id}.json`);
        if (!fs.existsSync(pathToFile)) {
            ctx.body = JSON.stringify({});
        } else {
            ctx.body = JSON.stringify(readJsonFile(pathToFile));
        }
    });

    router.post("/api/resource/multi/single/:resource/:id", async (ctx) => {
        const resourceDir = path.join(dirData, ctx.params.resource);
        ensureDirExists(resourceDir);
        await new Promise((resolve, reject) => {
            fs.writeFile(
                path.join(resourceDir, `${ctx.params.id}.json`),
                JSON.stringify(ctx.request.body),
                (err) => {
                    if (err) reject(err);
                    else resolve(null);
                }
            );
        });
        ctx.body = "OK";
    });

    router.delete("/api/resource/multi/single/:resource/:id", (ctx) => {
        const resourceDir = path.join(dirData, ctx.params.resource);
        ensureDirExists(resourceDir);

        const pathToFile = path.join(resourceDir, `${ctx.params.id}.json`);
        if (fs.existsSync(pathToFile)) fs.unlinkSync(pathToFile);
        ctx.body = "OK";
    });
};

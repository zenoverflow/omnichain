import path from "path";
import fs from "fs";

import type Router from "koa-router";

import { readJsonFile, ensureDirExists } from "./utils.ts";

export const setupResourcesApi = (
    router: Router,
    dirData: string,
    dirCustomNodes: string
) => {
    // API: custom nodes (fetch only)

    router.get("/api/custom_nodes", (ctx) => {
        const customNodes: string[] = [];

        for (const obj of fs.readdirSync(dirCustomNodes)) {
            // Check for makers in roots of subdirectories
            if (fs.statSync(path.join(dirCustomNodes, obj)).isDirectory()) {
                const subdir = path.join(dirCustomNodes, obj);
                // Read makers from subdirectory root
                for (const subObj of fs.readdirSync(subdir)) {
                    if (subObj.endsWith(".maker.js")) {
                        customNodes.push(
                            path.join(dirCustomNodes, obj, subObj)
                        );
                    }
                }
            }
            // Directly add makers from root custom_nodes directory
            else if (obj.endsWith(".maker.js")) {
                customNodes.push(path.join(dirCustomNodes, obj));
            }
        }
        ctx.body = JSON.stringify(
            customNodes.map((file) => [file, fs.readFileSync(file, "utf-8")])
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

    router.post("/api/resource/single/:resource", (ctx) => {
        fs.writeFileSync(
            path.join(dirData, `${ctx.params.resource}.json`),
            JSON.stringify(ctx.request.body)
        );
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

    router.post("/api/resource/multi/single/:resource/:id", (ctx) => {
        const resourceDir = path.join(dirData, ctx.params.resource);
        ensureDirExists(resourceDir);

        fs.writeFileSync(
            path.join(resourceDir, `${ctx.params.id}.json`),
            JSON.stringify(ctx.request.body)
        );
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

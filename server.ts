import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import minimist from "minimist";
import Koa from "koa";
import Router from "koa-router";
import { koaBody } from "koa-body";
import serve from "koa-static";

const argv: Record<string, any> = minimist(process.argv.slice(2));

const app = new Koa();
const router = new Router({
    // sensitive: true,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIR_DATA = path.join(__dirname, "data");
const DIR_CUSTOM_NODES = path.join(__dirname, "custom_nodes");

// Utils

const readJsonFile = (path: string) =>
    JSON.parse(fs.readFileSync(path, "utf-8")) as Record<string, any>;

const ensureDirExists = (dir: string) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
};

// Setup

ensureDirExists(DIR_DATA);
ensureDirExists(DIR_CUSTOM_NODES);

// API: custom nodes (fetch only)

router.get("/api/custom_nodes", (ctx) => {
    const customNodes: string[] = [];

    for (const obj of fs.readdirSync(DIR_CUSTOM_NODES)) {
        // Check for makers in roots of subdirectories
        if (fs.statSync(path.join(DIR_CUSTOM_NODES, obj)).isDirectory()) {
            const subdir = path.join(DIR_CUSTOM_NODES, obj);
            // Read makers from subdirectory root
            for (const subObj of fs.readdirSync(subdir)) {
                if (subObj.endsWith(".maker.js")) {
                    customNodes.push(path.join(DIR_CUSTOM_NODES, obj, subObj));
                }
            }
        }
        // Directly add makers from root custom_nodes directory
        else if (obj.endsWith(".maker.js")) {
            customNodes.push(path.join(DIR_CUSTOM_NODES, obj));
        }
    }
    ctx.body = JSON.stringify(
        customNodes.map((file) => [file, fs.readFileSync(file, "utf-8")])
    );
});

// API: single-file resources

router.get("/api/resource/single/:resource", (ctx) => {
    const pathToFile = path.join(DIR_DATA, `${ctx.params.resource}.json`);
    if (!fs.existsSync(pathToFile)) {
        ctx.body = JSON.stringify({});
    } else {
        ctx.body = JSON.stringify(readJsonFile(pathToFile));
    }
});

router.post("/api/resource/single/:resource", (ctx) => {
    fs.writeFileSync(
        path.join(DIR_DATA, `${ctx.params.resource}.json`),
        JSON.stringify(ctx.request.body)
    );
    ctx.body = "OK";
});

router.delete("/api/resource/single/:resource", (ctx) => {
    const pathToFile = path.join(DIR_DATA, `${ctx.params.resource}.json`);
    if (fs.existsSync(pathToFile)) fs.unlinkSync(pathToFile);
    ctx.body = "OK";
});

// API: multi-file resources

router.get("/api/resource/multi/index/:resource", (ctx) => {
    const resourceDir = path.join(DIR_DATA, ctx.params.resource);
    ensureDirExists(resourceDir);

    const resourceFiles = fs.readdirSync(resourceDir);
    ctx.body = JSON.stringify(
        Object.fromEntries(
            resourceFiles.map((file) => {
                const content = readJsonFile(
                    path.join(DIR_DATA, ctx.params.resource, file)
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
    const resourceDir = path.join(DIR_DATA, ctx.params.resource);
    ensureDirExists(resourceDir);

    const resourceFiles = fs.readdirSync(resourceDir);
    ctx.body = JSON.stringify(
        Object.fromEntries(
            resourceFiles.map((file) => {
                const content = readJsonFile(
                    path.join(DIR_DATA, ctx.params.resource, file)
                );
                // Grab id from filename (strip out the extension, use regex)
                const id = file.replace(/\.[^/.]+$/, "");
                return [id, content];
            })
        )
    );
});

router.get("/api/resource/multi/single/:resource/:id", (ctx) => {
    const resourceDir = path.join(DIR_DATA, ctx.params.resource);
    ensureDirExists(resourceDir);

    const pathToFile = path.join(resourceDir, `${ctx.params.id}.json`);
    if (!fs.existsSync(pathToFile)) {
        ctx.body = JSON.stringify({});
    } else {
        ctx.body = JSON.stringify(readJsonFile(pathToFile));
    }
});

router.post("/api/resource/multi/single/:resource/:id", (ctx) => {
    const resourceDir = path.join(DIR_DATA, ctx.params.resource);
    ensureDirExists(resourceDir);

    fs.writeFileSync(
        path.join(resourceDir, `${ctx.params.id}.json`),
        JSON.stringify(ctx.request.body)
    );
    ctx.body = "OK";
});

router.delete("/api/resource/multi/single/:resource/:id", (ctx) => {
    const resourceDir = path.join(DIR_DATA, ctx.params.resource);
    ensureDirExists(resourceDir);

    const pathToFile = path.join(resourceDir, `${ctx.params.id}.json`);
    if (fs.existsSync(pathToFile)) fs.unlinkSync(pathToFile);
    ctx.body = "OK";
});

// Config: middleware

app
    // body parsing
    .use(koaBody())
    // routing
    .use(router.routes())
    .use(router.allowedMethods())
    // frontend
    .use(serve(path.join(__dirname, "dist")));

// Config: server

const port: number = argv.port || 12538;

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port.toString()}`);
});

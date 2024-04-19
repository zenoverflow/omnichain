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
const router = new Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIR_DATA = path.join(__dirname, "data");

// Setup

if (!fs.existsSync(DIR_DATA)) fs.mkdirSync(DIR_DATA);

// Utils

const readJsonFile = (path: string) =>
    JSON.parse(fs.readFileSync(path, "utf-8")) as Record<string, any>;

// API: single-file resources

router.get("/api/resource/single/:resource", async (ctx) => {
    const pathToFile = path.join(DIR_DATA, `${ctx.params.resource}.json`);
    if (!fs.existsSync(pathToFile)) {
        ctx.body = {};
        return;
    }

    ctx.body = readJsonFile(pathToFile);
});

router.post("/api/resource/single/:resource", async (ctx) => {
    fs.writeFileSync(
        path.join(DIR_DATA, `${ctx.params.resource}.json`),
        JSON.stringify(ctx.body)
    );
});

router.delete("/api/resource/single/:resource", async (ctx) => {
    const pathToFile = path.join(DIR_DATA, `${ctx.params.resource}.json`);
    if (fs.existsSync(pathToFile)) fs.unlinkSync(pathToFile);
});

// API: multi-file resources

router.get("/api/resource/multi/:resource/all", async (ctx) => {
    const resourceFiles = fs.readdirSync(
        path.join(DIR_DATA, ctx.params.resource)
    );
    ctx.body = Object.fromEntries(
        resourceFiles.map((file) => {
            const content = readJsonFile(
                path.join(DIR_DATA, ctx.params.resource, file)
            );
            // Grab id from filename (strip out the extension, use regex)
            return [file.replace(/\.[^/.]+$/, ""), content];
        })
    );
});

router.get("/api/resource/multi/:resource/:id", async (ctx) => {
    const pathToFile = path.join(
        DIR_DATA,
        ctx.params.resource,
        `${ctx.params.id}.json`
    );
    if (!fs.existsSync(pathToFile)) {
        ctx.body = {};
        return;
    }

    ctx.body = readJsonFile(pathToFile);
});

router.post("/api/resource/multi/:resource/:id", async (ctx) => {
    fs.writeFileSync(
        path.join(DIR_DATA, ctx.params.resource, `${ctx.params.id}.json`),
        JSON.stringify(ctx.body)
    );
});

router.delete("/api/resource/multi/:resource/:id", async (ctx) => {
    const pathToFile = path.join(
        DIR_DATA,
        ctx.params.resource,
        `${ctx.params.id}.json`
    );
    if (fs.existsSync(pathToFile)) fs.unlinkSync(pathToFile);
});

// Config: middleware

app
    // routing
    .use(router.routes())
    .use(router.allowedMethods())
    // frontend
    .use(serve(path.join(__dirname, "dist")))
    // body parsing
    .use(koaBody);

// Config: server

const port: number = argv.port || 12538;

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port.toString()}`);
});

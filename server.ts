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
const DIR_AVATARS = path.join(DIR_DATA, "avatars");
const DIR_GRAPHS = path.join(DIR_DATA, "graphs");
const DIR_MESSAGES = path.join(DIR_DATA, "messages");
const FILE_OPTIONS = path.join(DIR_DATA, "options.json");

// Setup

if (!fs.existsSync(DIR_DATA)) fs.mkdirSync(DIR_DATA);
if (!fs.existsSync(DIR_AVATARS)) fs.mkdirSync(DIR_AVATARS);
if (!fs.existsSync(DIR_GRAPHS)) fs.mkdirSync(DIR_GRAPHS);
if (!fs.existsSync(DIR_MESSAGES)) fs.mkdirSync(DIR_MESSAGES);
if (!fs.existsSync(FILE_OPTIONS)) fs.writeFileSync(FILE_OPTIONS, "{}");

// Utils

const readJsonFile = (path: string) =>
    JSON.parse(fs.readFileSync(path, "utf-8")) as Record<string, any>;

// API: Options

router.get("/api/options", async (ctx) => {
    ctx.body = readJsonFile(FILE_OPTIONS);
});

router.post("/api/options", async (ctx) => {
    fs.writeFileSync(FILE_OPTIONS, JSON.stringify(ctx.body));
});

// API: Avatars

router.get("/api/avatars", async (ctx) => {
    const avatarsFiles = fs.readdirSync(DIR_AVATARS);
    ctx.body = Object.fromEntries(
        avatarsFiles.map((avatar) => {
            const content = readJsonFile(path.join(DIR_AVATARS, avatar));
            return [content.avatarId as string, content];
        })
    );
});

router.post("/api/avatars", async (ctx) => {
    const avatarId: string = ctx.body.avatarId;
    fs.writeFileSync(
        path.join(DIR_AVATARS, `${avatarId}.json`),
        JSON.stringify(ctx.body)
    );
});

// API: Graphs

router.get("/api/graphs", async (ctx) => {
    const graphsFiles = fs.readdirSync(DIR_GRAPHS);
    ctx.body = Object.fromEntries(
        graphsFiles.map((file) => {
            const content = readJsonFile(path.join(DIR_GRAPHS, file));
            return [content.graphId as string, content];
        })
    );
});

router.post("/api/graphs", async (ctx) => {
    const graphId: string = ctx.body.graphId;
    fs.writeFileSync(
        path.join(DIR_GRAPHS, `${graphId}.json`),
        JSON.stringify(ctx.body)
    );
});

// API: Messages

router.get("/api/messages/:graph", async (ctx) => {
    if (!fs.existsSync(path.join(DIR_MESSAGES, `${ctx.params.graph}.json`))) {
        ctx.body = {};
        return;
    }

    ctx.body = readJsonFile(
        path.join(DIR_MESSAGES, `${ctx.params.graph}.json`)
    );
});

router.post("/api/messages/:graph", async (ctx) => {
    fs.writeFileSync(
        path.join(DIR_MESSAGES, `${ctx.params.graph}.json`),
        JSON.stringify(ctx.body)
    );
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

import path from "path";
import { fileURLToPath } from "url";
import process from "process";

import minimist from "minimist";
import Koa from "koa";
import Router from "koa-router";
import { koaBody } from "koa-body";
import serve from "koa-static";

import { ensureDirExists } from "./server/utils.ts";
import { setupResourcesApi } from "./server/resources.ts";
import { setupExecutorApi } from "./server/executor.ts";

import { makeNode } from "./src/nodes/_nodes/_Base.ts";

// Attach node maker for custom nodes to use
(global as any).__ocMakeNode = makeNode;

// Catch unhandled exceptions

process.on("uncaughtException", function (err) {
    console.log("Uncaught Error: " + err.message);
});

// Base setup

const argv: Record<string, any> = minimist(process.argv.slice(2));
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIR_FRONTEND = path.join(__dirname, "dist");
const DIR_DATA = path.join(__dirname, "data");
const DIR_CUSTOM_NODES = path.join(__dirname, "custom_nodes");

ensureDirExists(DIR_DATA);
ensureDirExists(DIR_CUSTOM_NODES);

// Server setup

const appMain = new Koa();
const routerMain = new Router();

const portOpenAi: number = argv.port_openai || 5002;

setupResourcesApi(routerMain, DIR_DATA, DIR_CUSTOM_NODES);
setupExecutorApi(routerMain, DIR_DATA, DIR_CUSTOM_NODES, portOpenAi);

appMain
    // body parsing
    .use(koaBody({ jsonLimit: "10240gb" }))
    // routing
    .use(routerMain.routes())
    .use(routerMain.allowedMethods())
    // frontend
    .use(serve(DIR_FRONTEND));

const port: number = argv.port || 12538;

appMain.listen(port, () => {
    console.log(`App started on http://localhost:${port}`);
});

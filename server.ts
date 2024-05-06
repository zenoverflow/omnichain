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

// API setup

const app = new Koa();
const router = new Router();

setupResourcesApi(router, DIR_DATA, DIR_CUSTOM_NODES);
setupExecutorApi(router, DIR_DATA, DIR_CUSTOM_NODES);
// setupExecutorWs(router);

// Setup folders

ensureDirExists(DIR_DATA);
ensureDirExists(DIR_CUSTOM_NODES);

// Config: middleware

app
    // body parsing
    .use(
        koaBody({
            jsonLimit: "1gb",
        })
    )
    // routing
    .use(router.routes())
    .use(router.allowedMethods())
    // frontend
    .use(serve(DIR_FRONTEND));

// Config: server

const port: number = argv.port || 12538;

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port.toString()}`);
});

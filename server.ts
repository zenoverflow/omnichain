import path from "path";
import { fileURLToPath } from "url";
import process from "process";

import minimist from "minimist";
import Koa from "koa";
import Router from "koa-router";
import { koaBody } from "koa-body";
import serve from "koa-static";

import { globalServerConfig } from "./server/config.ts";
import { buildNodeRegistry, ensureDirExists } from "./server/utils.ts";
import { setupResourcesApi } from "./server/resources.ts";
import { setupExecutorApi } from "./server/executor.ts";

import { pingExternalModule } from "./server/external.ts";

import { makeNode } from "./src/nodes/_nodes/_Base.ts";
import { AppVersionUtils } from "./src/util/AppVersionUtils.ts";
import { setupTranscriptionAPI } from "./server/transcribe.ts";

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
ensureDirExists(DIR_FRONTEND);

globalServerConfig.dirFrontend = DIR_FRONTEND;

globalServerConfig.dirData = DIR_DATA;

globalServerConfig.dirCustomNodes = DIR_CUSTOM_NODES;

globalServerConfig.modulePythonUrl =
    argv.module_python_url || "http://localhost:12619";

globalServerConfig.nodeRegistry = buildNodeRegistry(DIR_CUSTOM_NODES);

// Server setup

const appMain = new Koa();
const routerMain = new Router();

const portOpenAi: number = argv.port_openai || 5002;

// Setup a simple route to return the version of the app
routerMain.get("/app-version", (ctx) => {
    ctx.body = { version: process.env.npm_package_version };
});

// Setup a simple route to ping external modules
routerMain.get("/ping-module/:module", async (ctx) => {
    const available = await pingExternalModule(ctx.params.module as any);
    ctx.status = available ? 200 : 400;
    ctx.body = "";
});

// Setup internal APIs
setupResourcesApi(routerMain);
setupTranscriptionAPI(routerMain);
setupExecutorApi(routerMain, portOpenAi);

appMain
    // body parsing
    .use(koaBody({ jsonLimit: "10240gb" }))
    // routing
    .use(routerMain.routes())
    .use(routerMain.allowedMethods())
    // frontend
    .use(serve(DIR_FRONTEND));

const port: number = argv.port || 12538;

void (async () => {
    // Check for updates
    try {
        const latestVersion = await AppVersionUtils.getVersionFromGithub();
        const currentVersion = process.env.npm_package_version;
        if (`${latestVersion}` !== `${currentVersion}`) {
            console.log("---");
            console.log(
                [
                    `A new update is available (v${currentVersion} => v${latestVersion}).`,
                    "To get the latest fixes and features, shut down the app",
                    "and run 'git pull' followed by 'npm install'.",
                ].join(" ")
            );
            console.log("---");
        }
    } catch (error) {
        console.error("Failed to check for updates:", error);
    }
})();

appMain.listen(port, () => {
    console.log(
        `OmniChain v${process.env.npm_package_version} started on http://localhost:${port}`
    );
});

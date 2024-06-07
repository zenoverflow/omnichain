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
import { AppVersionUtils } from "./src/util/AppVersionUtils.ts";

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

void (async () => {
    // Check for updates
    try {
        const latestVersion = await AppVersionUtils.getVersionFromGithub();
        const currentVersion = process.env.npm_package_version;
        // eslint-disable-next-line @typescript-eslint/no-useless-template-literals
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

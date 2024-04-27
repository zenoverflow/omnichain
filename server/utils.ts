import fs from "fs";
import path from "path";

import * as NODE_MAKERS from "../src/nodes/index.tsx";

import { CustomNodeUtils } from "../src/util/CustomNodeUtils.ts";

export const readJsonFile = (path: string) =>
    JSON.parse(fs.readFileSync(path, "utf-8")) as Record<string, any>;

export const ensureDirExists = (dir: string) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
};

/**
 * Warning: only use this on the backend!
 * It returns a registry of node makers, which are classes.
 * They are not serializable and should not be sent to the frontend.
 *
 * @param dirCustomNodes
 * @returns
 */
export const buildNodeRegistry = (dirCustomNodes: string) => {
    const customNodes: string[] = [];

    for (const obj of fs.readdirSync(dirCustomNodes)) {
        // Check for makers in roots of subdirectories
        if (fs.statSync(path.join(dirCustomNodes, obj)).isDirectory()) {
            const subdir = path.join(dirCustomNodes, obj);
            // Read makers from subdirectory root
            for (const subObj of fs.readdirSync(subdir)) {
                if (subObj.endsWith(".maker.js")) {
                    customNodes.push(path.join(dirCustomNodes, obj, subObj));
                }
            }
        }
        // Directly add makers from root custom_nodes directory
        else if (obj.endsWith(".maker.js")) {
            customNodes.push(path.join(dirCustomNodes, obj));
        }
    }
    return {
        ...NODE_MAKERS,
        ...CustomNodeUtils.buildCustomNodeRegistry(
            customNodes.map((file) => [file, fs.readFileSync(file, "utf-8")])
        ),
    } as Record<string, any>;
};

import fs from "fs";
import path from "path";

import type { CustomNode } from "../src/data/typesCustomNodes.ts";

import * as NODE_MAKERS from "../src/nodes/index.tsx";

export const readJsonFile = (path: string) =>
    JSON.parse(fs.readFileSync(path, "utf-8")) as Record<string, any>;

export const ensureDirExists = (dir: string) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
};

/**
 * Build a custom node registry from a list of [filename, rawJS].
 * Can be used from the frontend or backend.
 *
 * @param registry list of [filename, rawJS]
 * @returns custom node registry
 */
const _buildCustomNodeRegistry = (
    registry: [string, string][]
): Record<string, CustomNode> => {
    try {
        const internalNodes = Object.keys(NODE_MAKERS);
        const customNodeRegistry: Record<string, any> = {};

        for (const [name, rawJS] of registry) {
            try {
                const customNodeObj = eval(rawJS)() as
                    | CustomNode
                    | null
                    | undefined;

                if (!customNodeObj) {
                    console.error(
                        `Custom node eval failed for ${name}. Skipping.`
                    );
                    continue;
                }

                if (
                    internalNodes.includes(
                        customNodeObj.config.baseConfig.nodeName
                    )
                ) {
                    const n = customNodeObj.config.baseConfig.nodeName;
                    console.error(
                        `${n} already exists. Cannot add to custom nodes.`
                    );
                    continue;
                }

                customNodeRegistry[customNodeObj.config.baseConfig.nodeName] =
                    customNodeObj;
            } catch (error) {
                console.error(error);
                console.error(`Custom node eval failed for ${name}. Skipping.`);
            }
        }

        return customNodeRegistry;
    } catch (error) {
        console.error(error);
        return {};
    }
};

/**
 * Warning: only use this on the backend!
 * It returns a registry of node makers, which are classes.
 * They are not serializable and should not be sent to the frontend.
 *
 * @param dirCustomNodes
 * @param configOnly - removes the flow functions (used for the frontend)
 * @returns
 */
export const buildNodeRegistry = (
    dirCustomNodes: string,
    configOnly = false
) => {
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

    const result = {
        ...NODE_MAKERS,
        ..._buildCustomNodeRegistry(
            customNodes.map((file) => [file, fs.readFileSync(file, "utf-8")])
        ),
    } as Record<string, CustomNode>;

    if (configOnly) {
        return Object.fromEntries(
            Object.entries(result).map(([key, value]) => [
                key,
                {
                    ...value,
                    config: {
                        ...value.config,
                        flowConfig: null,
                    },
                },
            ])
        );
    }

    return result;
};

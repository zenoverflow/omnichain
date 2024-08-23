import axios from "axios";

import type { SerializedGraph } from "../data/types";

import { EnvUtils } from "./EnvUtils";

import { complexErrorObservable } from "../state/watcher";
import { nodeRegistryStorage } from "../state/nodeRegistry";
import { graphStorage } from "../state/graphs";

/**
 * Utility functions for handling external modules.
 *
 * CAUTION: This is a frontend-only utility!
 * It depends on frontend state and should not be used on the backend.
 */
export const ExternalModuleUtils = {
    async pingModule(module: string): Promise<boolean> {
        try {
            const res = await axios.get(
                `${EnvUtils.baseUrl()}/ping-module/${module}`
            );
            return res.status === 200;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    async checkGraphModuleRequirements(graphId: string): Promise<boolean> {
        const targetGraph = graphStorage.get()[
            graphId
        ] as SerializedGraph | null;

        if (!targetGraph) return false;

        // Missing external modules check
        const requiredExternalModules = new Set<string>(
            targetGraph.nodes.reduce<string[]>((acc, n) => {
                const nodeConfig = nodeRegistryStorage.get()[n.nodeType];
                return acc.concat(
                    Array.from(
                        nodeConfig.config.baseConfig.externalModules?.values() ||
                            []
                    )
                );
            }, [])
        );
        // Async map (ping every required external module)
        const missingExternalModules: string[] = [];

        for (const requiredModule of requiredExternalModules) {
            if (missingExternalModules.includes(requiredModule)) continue;

            const available = await ExternalModuleUtils.pingModule(
                requiredModule
            );

            if (!available) {
                missingExternalModules.push(requiredModule);
            }
        }

        if (missingExternalModules.length > 0) {
            complexErrorObservable.next([
                "Error!",
                `Cannot use graph! Requires connection to external modules: ${missingExternalModules.join(
                    ", "
                )}`,
            ]);
            return false;
        }

        return true;
    },
};

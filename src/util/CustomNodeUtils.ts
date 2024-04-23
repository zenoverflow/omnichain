import { EnvUtils } from "./EnvUtils";
import { makeNode } from "../nodes/_nodes/_Base";
import * as NODE_MAKERS from "../nodes";

export const CustomNodeUtils = {
    /**
     * Expose the node maker on the window object.
     * Allows third parties to plug in their own nodes.
     * Meant to be used from the frontend only.
     */
    exposeNodeMaker() {
        (window as any)._omnichat = {
            makeNode,
        };
    },

    /**
     * Build a custom node registry from a list of [filename, rawJS].
     * Can be used from the frontend or backend.
     *
     * @param registry list of [filename, rawJS]
     * @returns custom node registry
     */
    buildCustomNodeRegistry(registry: [string, string][]): Record<string, any> {
        try {
            const internalNodes = Object.keys(NODE_MAKERS);
            const customNodeRegistry: Record<string, any> = {};

            for (const [name, rawJS] of registry) {
                try {
                    const NodeClass = eval(rawJS)();

                    if (!NodeClass) {
                        console.error(
                            `Custom node eval failed for ${name}. Skipping.`
                        );
                        continue;
                    }

                    if (internalNodes.includes(NodeClass.customNodeName)) {
                        const n = NodeClass.customNodeName as string;
                        console.error(
                            `${n} already exists. Cannot add to custom nodes.`
                        );
                        continue;
                    }

                    customNodeRegistry[NodeClass.customNodeName] = NodeClass;
                } catch (error) {
                    console.error(error);
                    console.error(
                        `Custom node eval failed for ${name}. Skipping.`
                    );
                }
            }

            return customNodeRegistry;
        } catch (error) {
            console.error(error);
            return {};
        }
    },

    /**
     * Download the raw js logic for all custom nodes from the backend.
     * Meant to be used from the frontend only.
     */
    async consumeBackendRegistry(): Promise<Record<string, any>> {
        try {
            const res = await fetch(`${EnvUtils.baseUrl()}/api/custom_nodes`);
            const data = (await res.json()) as [string, string][];

            return CustomNodeUtils.buildCustomNodeRegistry(data);
        } catch (error) {
            console.error(error);
            return {};
        }
    },
};

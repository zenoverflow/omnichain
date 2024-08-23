import type { CustomNode } from "../src/data/typesCustomNodes.ts";

type GlobalServerConfig = {
    nodeRegistry: Record<string, CustomNode>;
    dirFrontend: string;
    dirData: string;
    dirCustomNodes: string;
    modulePythonUrl: string;
};

export const globalServerConfig: GlobalServerConfig = {} as any;

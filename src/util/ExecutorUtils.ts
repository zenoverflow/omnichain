import { EnvUtils } from "./EnvUtils";

export const ExecutorUtils = {
    async runGraph(graphId: string) {
        const execState = await fetch(
            `${EnvUtils.baseUrl()}/api/executor/run/${graphId}`,
            {
                method: "POST",
            }
        );
        const res = await execState.json();
        return res as Record<string, any>;
    },

    async stopGraph() {
        await fetch(`${EnvUtils.baseUrl()}/api/executor/stop`, {
            method: "POST",
        });
    },

    async pingExecutor() {
        try {
            const response = await fetch(
                `${EnvUtils.baseUrl()}/api/executor/ping`
            );
            return (await response.json()) as { type: string; data: any }[];
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async getState() {
        try {
            const response = await fetch(
                `${EnvUtils.baseUrl()}/api/executor/state`
            );
            const res = (await response.json()) as Record<string, any>;
            if (res.state) {
                return res.state as Record<string, any>;
            }
            return null;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
};

import axios from "axios";
import { EnvUtils } from "./EnvUtils";
import type { ChatMessage } from "../data/types";

export const ExecutorUtils = {
    async runGraph(graphId: string) {
        const execState = await axios.post(
            `${EnvUtils.baseUrl()}/api/executor/run/${graphId}`
        );
        return execState.data as Record<string, any>;
    },

    async stopGraph() {
        await axios.post(`${EnvUtils.baseUrl()}/api/executor/stop`);
    },

    async pingExecutor() {
        try {
            const response = await axios.get(
                `${EnvUtils.baseUrl()}/api/executor/ping`
            );
            return response.data as { type: string; data: any }[];
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async getState() {
        try {
            const response = await axios.get(
                `${EnvUtils.baseUrl()}/api/executor/state`
            );
            const res = response.data as Record<string, any>;
            if (res.state) {
                return res.state as Record<string, any>;
            }
            return null;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async sendMessage(message: ChatMessage) {
        await axios.post(
            `${EnvUtils.baseUrl()}/api/executor/message`,
            message,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    },
};

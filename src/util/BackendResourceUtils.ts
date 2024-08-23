import axios from "axios";
import { EnvUtils } from "./EnvUtils";
import type { ResourceIndex } from "../data/types";

export const BackendResourceUtils = {
    // Single-file resources

    async getSingle(resource: string) {
        try {
            const res = await axios.get(
                `${EnvUtils.baseUrl()}/api/resource/single/${resource}`
            );
            return res.data as Record<string, any>;
        } catch (error) {
            console.error(error);
            return {} as Record<string, any>;
        }
    },

    async setSingle(resource: string, data: Record<string, any>) {
        try {
            await axios.post(
                `${EnvUtils.baseUrl()}/api/resource/single/${resource}`,
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (error) {
            console.error(error);
        }
    },

    async deleteSingle(resource: string) {
        try {
            await axios.delete(
                `${EnvUtils.baseUrl()}/api/resource/single/${resource}`
            );
        } catch (error) {
            console.error(error);
        }
    },

    // Multi-file resources

    async getMultiIndex(resource: string) {
        try {
            const res = await axios.get(
                `${EnvUtils.baseUrl()}/api/resource/multi/index/${resource}`
            );
            return res.data as ResourceIndex;
        } catch (error) {
            console.error(error);
            return {} as ResourceIndex;
        }
    },

    async getMultiAll<T>(resource: string) {
        try {
            const res = await axios.get(
                `${EnvUtils.baseUrl()}/api/resource/multi/all/${resource}`
            );
            return res.data as Record<string, T>;
        } catch (error) {
            console.error(error);
            return {} as Record<string, T>;
        }
    },

    async getMultiSingle<T>(resource: string, id: string) {
        try {
            const res = await axios.get(
                `${EnvUtils.baseUrl()}/api/resource/multi/single/${resource}/${id}`
            );
            return res.data as T;
        } catch (error) {
            console.error(error);
            return {} as T;
        }
    },

    async setMultiSingle(
        resource: string,
        id: string,
        data: Record<string, any>
    ) {
        try {
            await axios.post(
                `${EnvUtils.baseUrl()}/api/resource/multi/single/${resource}/${id}`,
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (error) {
            console.error(error);
        }
    },

    async deleteMultiSingle(resource: string, id: string) {
        try {
            await axios.delete(
                `${EnvUtils.baseUrl()}/api/resource/multi/single/${resource}/${id}`
            );
        } catch (error) {
            console.error(error);
        }
    },
};

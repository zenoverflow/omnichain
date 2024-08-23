import axios from "axios";

import { globalServerConfig } from "./config.ts";

export const pingPythonModule = async (): Promise<boolean> => {
    try {
        const response = await axios.get(
            `${globalServerConfig.modulePythonUrl}/ping`
        );
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

export const callPythonModule = async (
    action: string,
    data: Record<string, any>
) => {
    if (!(await pingPythonModule())) {
        throw new Error("External Python module is not available");
    }

    const url = new URL(action, globalServerConfig.modulePythonUrl).href;

    const response = await axios.post(url, data, {
        headers: {
            "Content-Type": "application/json",
        },
    });

    const result: Record<string, any> = response.data;

    return result;
};

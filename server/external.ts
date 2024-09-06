import { callPythonModule, pingPythonModule } from "./python.ts";

export const pingExternalModule = async (
    module: "python"
): Promise<boolean> => {
    switch (module) {
        case "python":
            return await pingPythonModule();
        default:
            return false;
    }
};

export const callExternalModule = async (
    module: "python",
    action: string,
    data?: Record<string, any>
): Promise<Record<string, any> | string> => {
    const available = await pingExternalModule(module);

    if (!available) {
        throw new Error(`External module ${module} is not available`);
    }

    switch (module) {
        case "python":
            return await callPythonModule(action, data);
        default:
            throw new Error(`Invalid module: ${module}`);
    }
};

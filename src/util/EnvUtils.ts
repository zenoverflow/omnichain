export const EnvUtils = {
    modeIsDev() {
        return (import.meta as any).env.DEV as boolean;
    },

    baseUrl() {
        // Note: the port will always be the same in development
        // and fetch will use the same port as the page in production
        // so we can just hardcode the port here for development.
        return EnvUtils.modeIsDev() ? "http://localhost:12538" : "";
    },

    mkServerUrl(resource: string) {
        return `${EnvUtils.baseUrl()}/${resource}`;
    },
};

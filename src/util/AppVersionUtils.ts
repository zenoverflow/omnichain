export const AppVersionUtils = {
    async getVersionFromGithub() {
        const response = await fetch(
            "https://raw.githubusercontent.com/zenoverflow/omnichain/main/package.json"
        );
        // Then, parse the version from the file
        const json = await response.json();
        return json.version as string;
    },
};

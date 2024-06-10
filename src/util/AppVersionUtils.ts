export const AppVersionUtils = {
    async getVersionFromGithub() {
        const response = await fetch(
            "https://api.github.com/repos/zenoverflow/omnichain/contents/package.json"
        );
        // Then, parse the version from the file
        const json = await response.json();
        const packageJson = JSON.parse(atob(json.content));
        return packageJson.version as string;
    },
};

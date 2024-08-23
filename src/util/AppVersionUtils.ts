import axios from "axios";

export const AppVersionUtils = {
    async getVersionFromGithub() {
        const response = await axios.get(
            "https://api.github.com/repos/zenoverflow/omnichain/contents/package.json"
        );
        // Then, parse the version from the file
        const packageJson = JSON.parse(atob(response.data.content));
        return packageJson.version as string;
    },
};

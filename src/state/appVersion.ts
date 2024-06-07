import { AppVersionUtils } from "../util/AppVersionUtils";
import { showNotification } from "./notifications";

export const checkForUpdatesAndNotify = async () => {
    try {
        const latestVersion = await AppVersionUtils.getVersionFromGithub();
        const currentVersion = (import.meta as any).env.PACKAGE_VERSION;
        // eslint-disable-next-line @typescript-eslint/no-useless-template-literals
        if (`${latestVersion}` !== `${currentVersion}`) {
            showNotification({
                type: "warning",
                text: [
                    `A new update is available (v${currentVersion} => v${latestVersion}).`,
                    "To get the latest fixes and features, shut down the app",
                    "and run 'git pull' followed by 'npm install'.",
                ].join(" "),
                ts: Date.now(),
                duration: null,
            });
        }
    } catch (error) {
        console.error("Failed to check for updates:", error);
    }
};

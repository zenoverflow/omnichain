import { AppVersionUtils } from "../util/AppVersionUtils";
import { showNotification } from "./notifications";
import { StatefulObservable } from "../util/ObservableUtils";

export const versionStorage = new StatefulObservable<string>("");

export const loadAppVersion = async () => {
    const currentVersion = await fetch("/app-version")
        .then((res) => res.json())
        .then((data) => data.version as string);
    versionStorage.set(currentVersion);
};

export const checkForUpdatesAndNotify = async () => {
    const currentVersion = versionStorage.get();
    try {
        const latestVersion = await AppVersionUtils.getVersionFromGithub();

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

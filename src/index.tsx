import React from "react";
import ReactDOM from "react-dom/client";
// import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { loadGraphs } from "./state/graphs";
import { loadAvatars } from "./state/avatars";
import { loadOptions } from "./state/options";
import { loadApiKeys } from "./state/apiKeys";
import { loadNodeRegistry } from "./state/nodeRegistry";
import { loadExecutor } from "./state/executor";
import { checkForUpdatesAndNotify, loadAppVersion } from "./state/appVersion";

import { QueueUtils } from "./util/QueueUtils";

import { Editor } from "./ui/Editor";
import { runNodeContentOnZoomOutListener } from "./state/editor";

// const router = createBrowserRouter([
//     {
//         path: "/",
//         element: <Editor />,
//     },
// ]);

export const run = async () => {
    await loadAppVersion();

    await loadNodeRegistry();
    await loadGraphs();
    await loadAvatars();
    await loadApiKeys();
    await loadOptions();
    await loadExecutor();

    void checkForUpdatesAndNotify();

    runNodeContentOnZoomOutListener();

    QueueUtils.runQueue();

    const root = document.getElementById("root");

    if (root) {
        ReactDOM.createRoot(root).render(
            <React.StrictMode>
                <Editor />
            </React.StrictMode>
        );
    }
};

void run();

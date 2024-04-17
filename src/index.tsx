import React from "react";
import ReactDOM from "react-dom/client";
// import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { loadGraphsFromDb } from "./state/graphs";
import { loadAvatarsFromDb } from "./state/avatars";
import { clearRedundantOptions } from "./state/options";
import { loadApiKeysFromDb } from "./state/apiKeys";

import { QueueUtils } from "./util/QueueUtils";

import { Editor } from "./ui/Editor";

// const router = createBrowserRouter([
//     {
//         path: "/",
//         element: <Editor />,
//     },
// ]);

export const run = async () => {
    await loadGraphsFromDb();
    await loadAvatarsFromDb();
    await loadApiKeysFromDb();
    clearRedundantOptions();

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

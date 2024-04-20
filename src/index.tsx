import React from "react";
import ReactDOM from "react-dom/client";
// import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { loadGraphs } from "./state/graphs";
import { loadAvatars } from "./state/avatars";
import { loadOptions } from "./state/options";
import { loadApiKeys } from "./state/apiKeys";

import { QueueUtils } from "./util/QueueUtils";

import { Editor } from "./ui/Editor";

// const router = createBrowserRouter([
//     {
//         path: "/",
//         element: <Editor />,
//     },
// ]);

export const run = async () => {
    await loadGraphs();
    await loadAvatars();
    await loadApiKeys();
    await loadOptions();

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

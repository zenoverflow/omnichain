import React from "react";
import ReactDOM from "react-dom/client";
// import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider as StateProvider } from "jotai";

import { appStore } from "./state";
import { loadGraphsFromDb } from "./state/graphs";
import { loadAvatarsFromDb } from "./state/avatars";
import { clearRedundantOptions } from "./state/options";
import { loadApiKeysFromDb } from "./state/apiKeys";

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

    const root = document.getElementById("root");

    if (root) {
        ReactDOM.createRoot(root).render(
            <React.StrictMode>
                <StateProvider store={appStore}>
                    <Editor />
                </StateProvider>
            </React.StrictMode>
        );
    }
};

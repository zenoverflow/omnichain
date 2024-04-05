import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider as StateProvider } from "jotai";

import { appStore } from "./state";
import { loadGraphsFromDb } from "./state/graphs";
import { loadAvatarsFromDb } from "./state/avatars";
import { loadMessagesFromDb } from "./state/messages";
import { loadApiKeysFromDb } from "./state/apiKeys";

import { Editor } from "./ui/Editor";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Editor />,
    },
]);

export const run = async () => {
    await loadGraphsFromDb();
    await loadAvatarsFromDb();
    await loadMessagesFromDb();
    await loadApiKeysFromDb();

    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <StateProvider store={appStore}>
                <RouterProvider router={router} />
            </StateProvider>
        </React.StrictMode>
    );
};

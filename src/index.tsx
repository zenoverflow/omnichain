import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider as StateProvider } from "jotai";
import sodium from "libsodium-wrappers";

import { appStore } from "./state";
import { loadGraphsFromDb } from "./state/graphs";

import { Editor } from "./ui/Editor";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Editor />,
    },
]);

export const run = async () => {
    await sodium.ready;
    await loadGraphsFromDb();

    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <StateProvider store={appStore}>
                <RouterProvider router={router} />
            </StateProvider>
        </React.StrictMode>
    );
};

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import version from "vite-plugin-package-version";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), version()],
    build: {
        sourcemap: false,
        rollupOptions: {
            output: {
                entryFileNames: "assets/index.js",
            },
        },
    },
});

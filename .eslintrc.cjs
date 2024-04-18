module.exports = {
    root: true,
    // ignores: ["server.js"],
    ignorePatterns: ["dist", ".eslintrc.cjs"],
    overrides: [
        // Client configuration
        {
            env: { browser: true, es2020: true },
            extends: [
                "eslint:recommended",
                "plugin:@typescript-eslint/strict-type-checked",
                "plugin:react-hooks/recommended",
                "plugin:react/recommended",
                "plugin:react/jsx-runtime",
            ],
            parser: "@typescript-eslint/parser",
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                project: ["./tsconfig.json"],
                tsconfigRootDir: __dirname,
            },
            plugins: ["react-refresh"],
            rules: {
                "react-refresh/only-export-components": [
                    "warn",
                    { allowConstantExport: true },
                ],
                // "import/no-named-as-default": "off",
                "@typescript-eslint/no-floating-promises": "error",
                "@typescript-eslint/no-explicit-any": "off",
                "@typescript-eslint/no-unused-vars": "off",
                "@typescript-eslint/ban-ts-comment": "off",
                "@typescript-eslint/no-this-alias": "off",
                "@typescript-eslint/no-unsafe-assignment": "off",
                "@typescript-eslint/no-unsafe-member-access": "off",
                "@typescript-eslint/no-unsafe-argument": "off",
                "@typescript-eslint/no-unsafe-call": "off",
                "@typescript-eslint/require-await": "off",
                "react/prop-types": "off",
            },
            files: ["./src/**/*.{ts,tsx}"],
        },
        // Server configuration
        {
            env: { node: true, es2020: true },
            extends: [
                "eslint:recommended",
                "plugin:@typescript-eslint/strict-type-checked",
                "plugin:node/recommended",
            ],
            parser: "@typescript-eslint/parser",
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                project: ["./tsconfig.node.json"],
                tsconfigRootDir: __dirname,
            },
            rules: {
                "@typescript-eslint/no-floating-promises": "error",
                "@typescript-eslint/no-explicit-any": "off",
                "@typescript-eslint/no-unused-vars": "off",
                "@typescript-eslint/ban-ts-comment": "off",
                "@typescript-eslint/no-this-alias": "off",
                "@typescript-eslint/no-unsafe-assignment": "off",
                "@typescript-eslint/no-unsafe-member-access": "off",
                "@typescript-eslint/no-unsafe-argument": "off",
                "@typescript-eslint/no-unsafe-call": "off",
                "@typescript-eslint/require-await": "off",
            },
            files: ["./server/**/*.{ts,tsx}", "./server.ts"],
        },
    ],
};

// filepath: /Users/stash/Projects/cms-editor/eslint.config.js
const js = require("@eslint/js");
const globals = require("globals");
const tseslint = require("typescript-eslint");
const pluginReact = require("eslint-plugin-react");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
    tseslint.configs.recommended,
    {
    ignores: ["**/*.test.{js,ts,tsx}", "**/__tests__/**", "**/__tests__/*", "dist/", "tsconfig.json"],
    files: ["**/*.{js,ts,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
        "@typescript-eslint/no-explicit-any": "off",
        'no-unused-vars': 'off'
    }
  },
  pluginReact.configs.flat.recommended,
]);


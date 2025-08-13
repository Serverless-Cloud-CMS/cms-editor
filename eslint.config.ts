import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";



export default defineConfig([
    tseslint.configs.recommended,
    {
    ignores: ["**/*.test.{js,ts,tsx}", "**/__tests__/**", "**/__tests__/*", "dist/", "tsconfig.json"],
    files: ["**/*.{js,ts,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      // Override for all files, but you can scope to ts/tsx if needed
      "@typescript-eslint/no-explicit-any": "off",
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['off']
    }
  },
  pluginReact.configs.flat.recommended,
]);

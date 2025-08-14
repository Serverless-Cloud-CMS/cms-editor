// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import eslint from 'vite-plugin-eslint';

export default defineConfig({
    plugins: [react(), tsconfigPaths(), eslint(
        {ignorePatterns:["**/*.test.{js,ts,tsx}", "**/__tests__/**", "**/__tests__/*", "dist/", "tsconfig.json"]},
        )],
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.ts': 'ts',
                '.tsx': 'tsx',
            },
        },
    }

});
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        exclude: ["node_modules","coverage","dist","scripts","local"],
        environment: 'jsdom',
    },
})
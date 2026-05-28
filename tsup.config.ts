import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ["ai", "@ai-sdk/anthropic", "@ai-sdk/openai"],
  banner: {
    js: `/**
 * console.ai - AI-powered DevTools Error Assistant
 * https://www.npmjs.com/package/console.ai
 */`,
  },
});
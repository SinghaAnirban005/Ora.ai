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
  // Bundle groq-sdk; keep Node built-ins external
  noExternal: ["groq-sdk"],
  banner: {
    js: `/**
 * Ora.ai — AI-powered DevTools Error Assistant (Groq-powered)
 * https://www.npmjs.com/package/ora.ai
 */`,
  },
});

import { defineConfig } from "vite";

/**
 * Builds the self-contained script that runs inside the practice lab's sandbox
 * iframe (React + Testing Library + test engine). Output is committed so the
 * normal `npm run build` does not depend on this step; re-run it with
 * `npm run build:practice-runtime` after changing anything under
 * src/features/frontend-practice/runner.
 */
export default defineConfig({
  publicDir: false,
  define: { "process.env.NODE_ENV": JSON.stringify("development") },
  build: {
    outDir: "src/features/frontend-practice/runner/runtime",
    emptyOutDir: false,
    minify: true,
    lib: {
      entry: "src/features/frontend-practice/runner/runtime/entry.ts",
      formats: ["iife"],
      name: "PracticeRuntime",
      fileName: () => "runtime.bundle.js",
    },
  },
});

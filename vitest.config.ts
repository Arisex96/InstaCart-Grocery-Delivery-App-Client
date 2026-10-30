import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Separate from vite.config.ts so the app's dev/build config is untouched.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["src/features/frontend-practice/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    testTimeout: 30_000,
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    // @vitejs/plugin-react was installed but never registered, so React Fast
    // Refresh was silently disabled — every edit did a full page reload and
    // component state was lost.
    react(),
    tailwindcss(),
  ],
  server: {
    // Lets the app call `/api/...` in development without hardcoding the
    // server origin or needing CORS. In production VITE_API_URL is used.
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET ?? "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});

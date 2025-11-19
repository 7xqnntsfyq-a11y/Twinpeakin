import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cartographer } from "@replit/vite-plugin-cartographer";
import { devBanner } from "@replit/vite-plugin-dev-banner";
import runtimeErrorModal from "@replit/vite-plugin-runtime-error-modal";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cartographer(),
    devBanner(),
    runtimeErrorModal(),
  ],
  root: "./client",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@assets": path.resolve(__dirname, "./attached_assets"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});

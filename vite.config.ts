/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
    svgr({ exportAsDefault: true }),
    react(),
  ],

  resolve: {
    alias: {},
  },

  server: {
    port: 4240,
    host: "localhost",
    fs: {
      strict: false,
    },
  },

  worker: {
    format: "es",
    plugins: () => [],
  },

  // Target moved here — correct location for Vite 5.x / Rolldown
  build: {
    target: "es2022",
    sourcemap: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      plugins: [],
    },
  },

  // Minimal optimizeDeps to avoid validation errors
  optimizeDeps: {
    // Leaving empty — plugin will handle its own settings
  },
});
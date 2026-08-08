/// <reference types="vitest" />
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";

/**
 * @hinkal/common ships its own nested copy of the Solana stack, so the app and
 * the SDK would otherwise load two separate `@solana/web3.js` module
 * instances. `PublicKey` from one then fails `instanceof` inside the other and
 * Anchor mis-serializes it — surfacing as "encoding overruns Buffer".
 * Force every importer onto the single hoisted copy.
 */
const dedupedSolanaPackages = [
  "@solana/web3.js",
  "@solana/buffer-layout",
  "@solana/spl-token",
  "@solana/wallet-adapter-base",
  "@solana/wallet-adapter-react",
  // Anchor and its borsh/buffer-layout stack build the instruction data, so
  // they must be a single instance too.
  "@coral-xyz/anchor",
  "@coral-xyz/borsh",
  "buffer-layout",
];

const solanaAliases = Object.fromEntries(
  dedupedSolanaPackages.map((pkg) => [
    pkg,
    resolve(__dirname, "node_modules", pkg),
  ])
);

export default defineConfig({
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    svgr({ exportAsDefault: true }),
    react(),
  ],

  resolve: {
    alias: solanaAliases,
    dedupe: dedupedSolanaPackages,
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

  build: {
    sourcemap: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      plugins: [],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      tsconfig: "./tsconfig.json",
      // Limit target browsers due to issue: Big integer literals are not available in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari13" + 2 overrides)'
      target: "ES2022",
    },
  },
});

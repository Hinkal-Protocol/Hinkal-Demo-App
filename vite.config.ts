/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [svgr({ exportAsDefault: true },), react()],

  server: {
    port: 4240,
    host: 'localhost'
  },

  worker: {
    format: 'es',
    plugins: () => [],
  },

  build: {
    // target: "ESNext",
    sourcemap: false,
    commonjsOptions: {
      transformMixedEsModules: true
    },
    lib: {
      entry: 'src/main.tsx',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      plugins: [
      ],
    },
  },
  optimizeDeps: {
    exclude: ['@hinkal/common'], // DO NOT REMOVE THIS LINE: vite does not create "assets" folder in cache, but is trying to read from there: that's why we exclude from cache
    esbuildOptions: {
      tsconfig: './tsconfig.json',
      // Limit target browsers due to issue: Big integer literals are not available in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari13" + 2 overrides)'
      target: "ES2022",
    },
  },
});

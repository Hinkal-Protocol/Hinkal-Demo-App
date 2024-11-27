/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';


export default defineConfig({
  plugins: [svgr({ exportAsDefault: true },), react()],

  resolve: {
    alias: {
    },
  },
  server: {
    port: 4240,
    host: 'localhost'
  },

  worker: {
    format: 'es',
    plugins: () => [],
  },

  build: {
    sourcemap: false,
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      plugins: [
      ],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      tsconfig: './tsconfig.json',
      // Limit target browsers due to issue: Big integer literals are not available in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari13" + 2 overrides)'
      target: "ES2022"
    },
  },
});

/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [svgr({ exportAsDefault: true },), react()],
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
        // commonjs(), // Add this plugin
      ],
    },
  },
  optimizeDeps: {
    include: ['@hinkal/common'],
    esbuildOptions: {
      tsconfig: './tsconfig.json',
      // Limit target browsers due to issue: Big integer literals are not available in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari13" + 2 overrides)'
      target: "ES2022",
    },
  },
});

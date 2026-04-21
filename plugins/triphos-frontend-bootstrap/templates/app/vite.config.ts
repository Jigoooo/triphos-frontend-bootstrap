import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 4000,
    open: true,
  },
  plugins: [
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  define: {
    global: 'globalThis',
  },
  test: {
    environment: 'jsdom',
  },
});

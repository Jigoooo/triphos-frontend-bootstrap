import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 4000,
    open: true,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  define: {
    global: 'globalThis',
  },
  test: {
    environment: 'jsdom',
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-motion',
              test: /node_modules[\\/]framer-motion[\\/]/,
              priority: 30,
            },
            {
              name: 'vendor-floating-ui',
              test: /node_modules[\\/]@floating-ui[\\/]/,
              priority: 25,
            },
            {
              name: 'vendor-date',
              test: /node_modules[\\/]date-fns[\\/]/,
              priority: 20,
              entriesAware: true,
            },
            {
              name: 'vendor-tanstack',
              test: /node_modules[\\/]@tanstack[\\/](react-query|react-router)[\\/]/,
              priority: 15,
              entriesAware: true,
            },
            {
              name: 'vendor-misc',
              test: /node_modules[\\/]/,
              priority: 1,
              minSize: 80 * 1024,
              entriesAware: true,
            },
          ],
        },
      },
    },
  },
});

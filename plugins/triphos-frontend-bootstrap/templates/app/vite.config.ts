import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiOrigin = env.VITE_API_ORIGIN || 'http://localhost:3001';
  const apiPrefix = env.VITE_API_PREFIX || '/api';

  return {
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_PORT || 3000),
      open: true,
      proxy: {
        [apiPrefix]: {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      svgr({
        svgrOptions: {
          expandProps: 'start',
          svgo: true,
        },
      }),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      ViteImageOptimizer({
        test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
        includePublic: true,
        logStats: true,
        ansiColors: true,
        svg: {
          multipass: true,
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  cleanupNumericValues: false,
                },
              },
            },
            'sortAttrs',
            {
              name: 'addAttributesToSVGElement',
              params: {
                attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
              },
            },
          ],
        },
        png: {
          quality: 100,
        },
        jpeg: {
          quality: 100,
        },
        jpg: {
          quality: 100,
        },
        tiff: {
          quality: 100,
        },
        gif: {},
        webp: {
          lossless: false,
        },
        avif: {
          lossless: true,
        },
        cache: false,
      }),
    ],
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
  };
});

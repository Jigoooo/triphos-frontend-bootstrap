import babel from '@rolldown/plugin-babel';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { loadEnv } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiUrl = env['VITE_API_URL'] || 'http://localhost';
  const apiPort = env['VITE_API_PORT'] || '3001';
  const apiSuffix = (env['VITE_SUFFIX_API_ENDPOINT'] || 'api').replace(/^\/+|\/+$/g, '');
  const apiPrefix = `/${apiSuffix}`;
  const apiOrigin = `${apiUrl}:${apiPort}`;

  return {
    server: {
      host: '0.0.0.0',
      port: Number(env['VITE_PORT'] || 3000),
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
      tanstackStart(),
      nitro(),
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
        png: { quality: 100 },
        jpeg: { quality: 100 },
        jpg: { quality: 100 },
        tiff: { quality: 100 },
        gif: {},
        webp: { lossless: false },
        avif: { lossless: true },
        cache: false,
      }),
    ],
    test: {
      environment: 'jsdom',
    },
  };
});

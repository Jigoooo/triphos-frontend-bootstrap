#!/usr/bin/env node

import { resolve } from 'node:path';

import {
  DEFAULT_PORT,
  assertTriphos,
  buildHarnessSummary,
  ensureArtifactsDir,
  readStableHarnessRoute,
  withHarnessServer,
  writeHarnessJson,
} from './harness/harness-lib.mjs';

const appRoot = process.cwd();
const artifactDir = ensureArtifactsDir(appRoot, 'e2e');
const routes = [
  {
    route: '/',
    label: 'home',
    requiredText: ['Triphos frontend bootstrap', 'Starter route'],
  },
  {
    route: '/starter',
    label: 'starter',
    requiredText: ['Triphos UI starter', 'Form controls', 'Feedback & Overlays', 'Loading & Progress'],
  },
];

await withHarnessServer(
  appRoot,
  async ({ origin }) => {
    for (const item of routes) {
      const { dom } = await readStableHarnessRoute(
        origin,
        item.route,
        (snapshot) =>
          item.requiredText.every((text) => snapshot.dom.window.document.body.textContent?.includes(text)),
      );

      for (const text of item.requiredText) {
        assertTriphos(
          dom.window.document.body.textContent?.includes(text) ?? false,
          `Expected DOM text "${text}" for ${item.label}.`,
        );
      }

      writeHarnessJson(resolve(artifactDir, `${item.label}.json`), {
        route: item.route,
        requiredText: item.requiredText,
      });
      console.log(buildHarnessSummary(item.label));
    }
  },
  { port: DEFAULT_PORT },
);

console.log('Triphos e2e verification passed.');

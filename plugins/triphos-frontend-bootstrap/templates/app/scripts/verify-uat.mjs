#!/usr/bin/env node

import { resolve } from 'node:path';

import {
  DEFAULT_PORT,
  assertTriphos,
  ensureArtifactsDir,
  readStableHarnessRoute,
  withHarnessServer,
  writeHarnessJson,
} from './harness/harness-lib.mjs';

const appRoot = process.cwd();
const artifactDir = ensureArtifactsDir(appRoot, 'uat');

await withHarnessServer(
  appRoot,
  async ({ origin }) => {
    const home = await readStableHarnessRoute(
      origin,
      '/',
      (snapshot) =>
        snapshot.dom.window.document.body.textContent?.includes('Triphos frontend bootstrap') &&
        snapshot.dom.window.document.body.textContent?.includes('Starter route'),
    );
    assertTriphos(
      home.dom.window.document.body.textContent?.includes('Starter route') ?? false,
      'UAT expected the home route to expose the starter CTA.',
    );
    assertTriphos(
      home.dom.window.document.body.textContent?.includes('React 19 + Compiler + FSD starter') ?? false,
      'UAT expected the home route to keep the bootstrap headline.',
    );
    writeHarnessJson(resolve(artifactDir, 'home.json'), {
      route: '/',
      checks: ['Triphos frontend bootstrap', 'Starter route', 'React 19 + Compiler + FSD starter'],
    });

    const starter = await readStableHarnessRoute(
      origin,
      '/starter',
      (snapshot) =>
        snapshot.dom.window.document.body.textContent?.includes('Triphos UI starter') &&
        snapshot.dom.window.document.body.textContent?.includes('Form controls'),
    );
    for (const text of ['Form controls', 'Buttons and feedback', 'Scroll utilities']) {
      assertTriphos(
        starter.dom.window.document.body.textContent?.includes(text) ?? false,
        `UAT expected starter route text "${text}".`,
      );
    }
    writeHarnessJson(resolve(artifactDir, 'starter.json'), {
      route: '/starter',
      checks: ['Triphos UI starter', 'Form controls', 'Buttons and feedback', 'Scroll utilities'],
    });
  },
  { port: DEFAULT_PORT },
);

console.log('Triphos UAT verification passed.');

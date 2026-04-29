#!/usr/bin/env node

import { resolve } from 'node:path';

import sharp from 'sharp';

import {
  DEFAULT_PORT,
  DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
  assertTriphos,
  captureHarnessScreenshot,
  ensureArtifactsDir,
  readStableHarnessRoute,
  withHarnessServer,
  writeHarnessJson,
} from './harness/harness-lib.mjs';

const appRoot = process.cwd();
const artifactDir = ensureArtifactsDir(appRoot, 'visual');
const baselineDir = resolve(appRoot, 'docs', 'quality', 'visual-baseline');
const route = '/starter';
const cases = [
  {
    name: 'starter-desktop',
    viewport: DESKTOP_VIEWPORT,
    baselinePath: resolve(baselineDir, 'starter-desktop.png'),
    outputPath: resolve(artifactDir, 'starter-desktop.png'),
  },
  {
    name: 'starter-mobile',
    viewport: MOBILE_VIEWPORT,
    baselinePath: resolve(baselineDir, 'starter-mobile.png'),
    outputPath: resolve(artifactDir, 'starter-mobile.png'),
  },
];

async function compareImages(baselinePath, outputPath) {
  const baseline = await sharp(baselinePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const current = await sharp(outputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  assertTriphos(
    baseline.info.width === current.info.width && baseline.info.height === current.info.height,
    `Visual baseline size mismatch for ${outputPath}.`,
  );

  let changedPixels = 0;
  for (let index = 0; index < baseline.data.length; index += 4) {
    const diff =
      Math.abs(baseline.data[index] - current.data[index]) +
      Math.abs(baseline.data[index + 1] - current.data[index + 1]) +
      Math.abs(baseline.data[index + 2] - current.data[index + 2]) +
      Math.abs(baseline.data[index + 3] - current.data[index + 3]);

    if (diff > 24) {
      changedPixels += 1;
    }
  }

  const totalPixels = baseline.info.width * baseline.info.height;
  const changedRatio = totalPixels > 0 ? changedPixels / totalPixels : 0;

  return {
    changedPixels,
    changedRatio,
    width: baseline.info.width,
    height: baseline.info.height,
  };
}

for (const item of cases) {
  await withHarnessServer(
    appRoot,
    async ({ origin }) => {
      const snapshot = await readStableHarnessRoute(
        origin,
        route,
        ({ dom }) => dom.window.document.body.textContent?.includes('Triphos UI starter') ?? false,
      );
      assertTriphos(
        snapshot.dom.window.document.body.textContent?.includes('Triphos UI starter') ?? false,
        `Visual verification did not load the starter route for ${item.name}.`,
      );
      captureHarnessScreenshot(origin, route, item.outputPath, { viewport: item.viewport });
      const diff = await compareImages(item.baselinePath, item.outputPath);

      assertTriphos(
        diff.changedRatio <= 0.01,
        `Visual verification drifted for ${item.name}. changedRatio=${diff.changedRatio.toFixed(4)}`,
      );

      writeHarnessJson(resolve(artifactDir, `${item.name}.json`), diff);
      console.log(`${item.name}: changedRatio=${diff.changedRatio.toFixed(4)}`);
    },
    { port: DEFAULT_PORT },
  );
}

console.log('Triphos visual verification passed.');

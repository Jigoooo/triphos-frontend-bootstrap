#!/usr/bin/env node

import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import {
  DEFAULT_PORT,
  DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
  captureHarnessScreenshot,
  defaultScreenshotOutputPath,
  parseArgs,
  resolveRequestedOutput,
  withHarnessServer,
} from './harness/harness-lib.mjs';

const appRoot = process.cwd();
const args = parseArgs(process.argv.slice(2));
const route = args.route ?? '/starter';
const viewportName = args.viewport === 'mobile' ? 'mobile' : 'desktop';
const viewport = viewportName === 'mobile' ? MOBILE_VIEWPORT : DESKTOP_VIEWPORT;
const outputPath = resolveRequestedOutput(
  appRoot,
  args.output,
  defaultScreenshotOutputPath(appRoot, route, viewportName),
);

await withHarnessServer(
  appRoot,
  async ({ origin }) => {
    mkdirSync(dirname(outputPath), { recursive: true });
    captureHarnessScreenshot(origin, route, outputPath, { viewport });
    console.log(`Captured screenshot: ${resolve(outputPath)}`);
  },
  { port: Number(args.port ?? DEFAULT_PORT) },
);

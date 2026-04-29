#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import {
  DEFAULT_PORT,
  defaultDomOutputPath,
  dumpHarnessDom,
  parseArgs,
  resolveRequestedOutput,
  withHarnessServer,
} from './harness/harness-lib.mjs';

const appRoot = process.cwd();
const args = parseArgs(process.argv.slice(2));
const route = args.route ?? '/starter';
const outputPath = resolveRequestedOutput(appRoot, args.output, defaultDomOutputPath(appRoot, route));

await withHarnessServer(
  appRoot,
  async ({ origin }) => {
    const html = await dumpHarnessDom(origin, route);

    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, html);

    console.log(`Captured DOM: ${resolve(outputPath)}`);
  },
  { port: Number(args.port ?? DEFAULT_PORT) },
);

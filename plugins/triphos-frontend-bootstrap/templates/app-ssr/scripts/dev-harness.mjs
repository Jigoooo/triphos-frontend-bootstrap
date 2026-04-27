#!/usr/bin/env node

import { spawn } from 'node:child_process';

import { DEFAULT_HOST, DEFAULT_PORT } from './harness/harness-lib.mjs';

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const port = process.env.TRIPHOS_HARNESS_PORT ?? String(DEFAULT_PORT);

console.log(`Triphos harness dev server: http://${DEFAULT_HOST}:${port}`);
console.log('Suggested checks: pnpm capture:dom --route /starter');
console.log('Suggested checks: pnpm capture:screenshot --route /starter');

const child = spawn(
  pnpm,
  ['vite', 'dev', '--host', DEFAULT_HOST, '--port', port, '--strictPort'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      BROWSER: 'none',
    },
  },
);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

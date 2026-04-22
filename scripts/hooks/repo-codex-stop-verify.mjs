#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const result = spawnSync('pnpm', ['verify:repo'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  stdio: 'pipe',
});

if (result.status === 0) {
  process.exit(0);
}

const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
process.stdout.write(
  JSON.stringify({
    decision: 'block',
    reason: `Triphos repository verification failed. Fix the reported issues and rerun pnpm verify:repo.\n${output}`,
  }),
);

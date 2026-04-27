#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appRoot = process.cwd();
const skip = String(process.env['TRIPHOS_SKIP_LIGHTHOUSE'] ?? '').toLowerCase();
if (['1', 'true', 'yes', 'on'].includes(skip)) {
  console.log('Lighthouse check skipped via TRIPHOS_SKIP_LIGHTHOUSE.');
  process.exit(0);
}

function readPortFromEnv() {
  try {
    const raw = readFileSync(resolve(appRoot, '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/u)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, value] = trimmed.split('=');
      if (key?.trim() === 'VITE_PORT' && value) {
        const parsed = Number(value.trim());
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
      }
    }
  } catch {
    // .env missing → fall back to default
  }
  return 3000;
}

const port = readPortFromEnv();
const configPath = resolve(appRoot, 'lighthouserc.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
config.ci.collect.url = [`http://localhost:${port}/`, `http://localhost:${port}/starter`];
config.ci.collect.startServerCommand = `pnpm build && pnpm start --port ${port}`;

const tmpConfig = resolve(appRoot, '.lighthouserc.runtime.json');
writeFileSync(tmpConfig, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

const result = spawnSync('npx', ['--no-install', 'lhci', 'autorun', `--config=${tmpConfig}`], {
  cwd: appRoot,
  stdio: 'inherit',
  env: { ...process.env, PORT: String(port) },
});

if (result.status !== 0) {
  console.error('Lighthouse CI failed. See output above.');
  process.exit(result.status ?? 1);
}

console.log(`Lighthouse audit passed (port ${port}).`);

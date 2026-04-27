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

// Capture lhci output instead of streaming it inherit-style. The raw lhci log
// can be hundreds of KB of audit detail and end up in agent context if a stop
// hook re-emits stdout — we keep it on disk and only surface category scores.
const result = spawnSync('npx', ['--no-install', 'lhci', 'autorun', `--config=${tmpConfig}`], {
  cwd: appRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, PORT: String(port) },
  encoding: 'utf8',
});

const rawLog = `${result.stdout ?? ''}${result.stderr ?? ''}`;
const logPath = resolve(appRoot, '.lighthouseci', 'lhci.log');
try {
  const { mkdirSync } = await import('node:fs');
  mkdirSync(resolve(appRoot, '.lighthouseci'), { recursive: true });
  writeFileSync(logPath, rawLog, 'utf8');
} catch {
  // .lighthouseci write failure is non-fatal; the summary still prints below.
}

const summaryRe =
  /(performance|accessibility|best-practices|seo|pwa)[^\d]*?([01](?:\.\d+)?)/giu;
const seen = new Map();
for (const match of rawLog.matchAll(summaryRe)) {
  const key = match[1].toLowerCase();
  const value = Number(match[2]);
  if (!Number.isFinite(value)) continue;
  if (!seen.has(key)) seen.set(key, value);
}

if (seen.size > 0) {
  const lines = Array.from(seen.entries()).map(([k, v]) => `  - ${k}: ${v.toFixed(2)}`);
  console.log(`Lighthouse category scores (first occurrence per category):\n${lines.join('\n')}`);
}

if (result.status !== 0) {
  console.error(`Lighthouse CI failed (exit ${result.status}). Full log: ${logPath}`);
  process.exit(result.status ?? 1);
}

console.log(`Lighthouse audit passed (port ${port}). Full log: ${logPath}`);

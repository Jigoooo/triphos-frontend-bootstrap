#!/usr/bin/env node

import { readRecentFailures, summarizeRecentFailures } from './hooks/trace-lib.mjs';

function parseLimit(argv) {
  const flagIndex = argv.findIndex((arg) => arg === '--limit' || arg === '-n');
  if (flagIndex >= 0 && argv[flagIndex + 1]) {
    const parsed = Number.parseInt(argv[flagIndex + 1], 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 20;
}

const limit = parseLimit(process.argv.slice(2));
const cwd = process.cwd();
const entries = readRecentFailures(cwd, limit);

if (entries.length === 0) {
  console.log('No verifier failure traces recorded under .triphos/traces/.');
  process.exit(0);
}

const counts = new Map();
const surfaceCounts = new Map();
for (const entry of entries) {
  const sig = entry.failureSignature || 'unparsed';
  counts.set(sig, (counts.get(sig) ?? 0) + 1);
  const surface = entry.surface || 'unknown';
  surfaceCounts.set(surface, (surfaceCounts.get(surface) ?? 0) + 1);
}

const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);

console.log(`Triphos verifier failure trace summary (last ${entries.length})`);
console.log(`Window: ${entries[0].ts}  →  ${entries.at(-1).ts}`);
console.log('');
console.log('By surface:');
for (const [surface, count] of [...surfaceCounts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${surface.padEnd(8)} ${count}`);
}
console.log('');
console.log('Top failure signatures:');
for (const [sig, count] of ranked) {
  console.log(`  ×${String(count).padStart(3)}  ${sig}`);
}
console.log('');
console.log('Inject preview (next SessionStart):');
console.log('---');
console.log(summarizeRecentFailures(cwd, 5));
console.log('---');

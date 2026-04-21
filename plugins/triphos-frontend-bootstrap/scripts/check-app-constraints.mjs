#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = value;
    index += 1;
  }
  return args;
}

function collectFiles(rootDir) {
  const queue = [rootDir];
  const files = [];

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current) continue;

    for (const entry of readdirSync(current)) {
      const fullPath = resolve(current, entry);
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        queue.push(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  return files;
}

const args = parseArgs(process.argv.slice(2));
const target = args.target ? resolve(process.cwd(), args.target) : null;

if (!target) {
  console.error('Usage: node check-app-constraints.mjs --target <app-root>');
  process.exit(1);
}

const requiredFiles = [
  'AGENTS.md',
  'AGENTS.en.md',
  'CLAUDE.md',
  'CLAUDE.en.md',
  'src/shared/theme/index.ts',
  'src/shared/constants/index.ts',
  'src/shared/types/index.ts',
  'src/pages/starter/ui/starter-page.tsx',
];

const missing = requiredFiles.filter((relativePath) => !existsSync(resolve(target, relativePath)));
if (missing.length > 0) {
  console.error('Missing required scaffold files:');
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

const allowlist = [
  /overlay-scrollbar/i,
];

const srcRoot = resolve(target, 'src');
const files = collectFiles(srcRoot).filter((file) => file.endsWith('.ts') || file.endsWith('.tsx'));
const classNameUsages = [];

for (const file of files) {
  if (allowlist.some((pattern) => pattern.test(file))) continue;
  const content = readFileSync(file, 'utf8');
  if (content.includes('className')) {
    classNameUsages.push(file);
  }
}

if (classNameUsages.length > 0) {
  console.error('Disallowed className usage detected:');
  for (const item of classNameUsages) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log(`App constraints passed: ${target}`);

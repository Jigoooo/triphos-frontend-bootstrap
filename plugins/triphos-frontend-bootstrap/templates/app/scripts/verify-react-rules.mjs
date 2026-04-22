#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';

const appRoot = process.cwd();
const srcRoot = resolve(appRoot, 'src');
const tsExtensions = new Set(['.ts', '.tsx']);
const allowClassNamePatterns = [/overlay-scrollbar/u];
const failures = [];

function walk(currentPath) {
  const stats = statSync(currentPath);
  if (stats.isDirectory()) {
    for (const entry of readdirSync(currentPath)) {
      walk(resolve(currentPath, entry));
    }
    return;
  }

  if (!tsExtensions.has(extname(currentPath))) return;

  const content = readFileSync(currentPath, 'utf8');

  if (content.includes('className') && !allowClassNamePatterns.some((pattern) => pattern.test(currentPath))) {
    failures.push(`${currentPath} contains forbidden className usage`);
  }
  if (content.includes('useMemo(')) {
    failures.push(`${currentPath} contains forbidden useMemo usage`);
  }
  if (content.includes('useCallback(')) {
    failures.push(`${currentPath} contains forbidden useCallback usage`);
  }
}

walk(srcRoot);

if (failures.length > 0) {
  console.error('React rules verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('React rules verification passed.');

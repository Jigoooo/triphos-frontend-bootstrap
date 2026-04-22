#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';

const appRoot = process.cwd();
const srcRoot = resolve(appRoot, 'src');
const sliceRoots = ['pages', 'widgets', 'features', 'entities'];
const forbiddenSegmentDirs = new Set(['hooks', 'types', 'components', 'stores']);
const namingPattern = /use-[\w-]+-(page|orchestration|manager)\.tsx?$/u;
const tsExtensions = new Set(['.ts', '.tsx']);
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
  if (content.includes('eslint-disable react-hooks/')) {
    failures.push(`${currentPath} contains forbidden eslint-disable react-hooks/* usage`);
  }
  if (namingPattern.test(currentPath)) {
    failures.push(`${currentPath} matches forbidden orchestration hook naming`);
  }
}

for (const layer of sliceRoots) {
  const layerPath = resolve(srcRoot, layer);

  try {
    for (const slice of readdirSync(layerPath)) {
      const slicePath = resolve(layerPath, slice);
      if (!statSync(slicePath).isDirectory()) continue;

      for (const entry of readdirSync(slicePath)) {
        const entryPath = resolve(slicePath, entry);
        if (statSync(entryPath).isDirectory() && forbiddenSegmentDirs.has(entry)) {
          failures.push(`${entryPath} uses a forbidden FSD essence-based directory`);
        }
      }
    }
  } catch {
    // Ignore missing layers so the script can run in smaller apps.
  }
}

walk(srcRoot);

if (failures.length > 0) {
  console.error('FSD verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('FSD verification passed.');

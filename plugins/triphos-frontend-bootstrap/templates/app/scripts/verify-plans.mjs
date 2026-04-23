#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import { listChangedFiles, makePathMatchers } from './hooks/stop-verify-lib.mjs';

const appRoot = process.cwd();
const changedFiles = listChangedFiles(appRoot);
const templateSourceMarker = resolve(appRoot, '.triphos-template-source');

if (existsSync(templateSourceMarker)) {
  console.log('Plan verification skipped: template source is exempt from generated-app plan enforcement.');
  process.exit(0);
}

if (!changedFiles) {
  console.log('Plan verification skipped: no git repository detected.');
  process.exit(0);
}

const gitRootResult = spawnSync('git', ['rev-parse', '--show-toplevel'], {
  cwd: appRoot,
  encoding: 'utf8',
  stdio: 'pipe',
});

if (gitRootResult.status !== 0) {
  console.log('Plan verification skipped: no git repository detected.');
  process.exit(0);
}

const gitRoot = gitRootResult.stdout.trim();
const normalizedGitRoot = resolve(gitRoot);
const normalizedAppRoot = resolve(appRoot);
const appScope = relative(normalizedGitRoot, normalizedAppRoot).replaceAll('\\', '/');

const localChangedFiles =
  appScope.length === 0
    ? changedFiles
    : changedFiles
        .filter((filePath) => filePath === appScope || filePath.startsWith(`${appScope}/`))
        .map((filePath) => filePath.slice(appScope.length + 1));

if (localChangedFiles.length === 0) {
  console.log('Plan verification skipped: no app-scoped changes detected.');
  process.exit(0);
}

const PLAN_FILE_NAMES = ['PLAN.md', 'STATUS.md', 'DECISIONS.md', 'VERIFICATION.md'];
const planFilePattern = /^docs\/plans\/(?:active|completed)\/[^/]+\/(?:PLAN|STATUS|DECISIONS|VERIFICATION)\.md$/u;
const nonPlanChangedFiles = localChangedFiles.filter(
  (filePath) => !planFilePattern.test(filePath) && !filePath.startsWith('.triphos/'),
);

const nonTrivialMatchers = makePathMatchers({
  directories: [
    'src/app',
    'src/shared/api',
    'src/shared/theme',
    'src/shared/ui',
    'scripts',
    'docs/architecture',
    'docs/product',
    'docs/quality',
    'docs/decisions',
  ],
  exact: [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'AGENTS.md',
    'AGENTS.en.md',
    'CLAUDE.md',
    'CLAUDE.en.md',
    'docs/README.md',
  ],
});

const isNonTrivial =
  nonPlanChangedFiles.length >= 3 ||
  nonPlanChangedFiles.some((filePath) => nonTrivialMatchers.some((matcher) => matcher(filePath)));

if (!isNonTrivial) {
  console.log('Plan verification skipped: no non-trivial changes detected.');
  process.exit(0);
}

const changedPlanDirs = Array.from(
  new Set(
    localChangedFiles
      .filter((filePath) => planFilePattern.test(filePath))
      .map((filePath) => dirname(filePath)),
  ),
);

const completePlanDir = changedPlanDirs.find((directory) =>
  PLAN_FILE_NAMES.every((fileName) => existsSync(resolve(appRoot, directory, fileName))),
);

if (!completePlanDir) {
  console.error('Plan verification failed.');
  console.error('Non-trivial changes require a plan bundle updated in the current change set.');
  console.error('Create docs/plans/active/<date>-<slug>/PLAN.md, STATUS.md, DECISIONS.md, and VERIFICATION.md.');
  console.error('Changed files that triggered the requirement:');
  for (const filePath of nonPlanChangedFiles.slice(0, 20)) {
    console.error(`- ${filePath}`);
  }
  process.exit(1);
}

console.log(`Plan verification passed: ${completePlanDir}`);

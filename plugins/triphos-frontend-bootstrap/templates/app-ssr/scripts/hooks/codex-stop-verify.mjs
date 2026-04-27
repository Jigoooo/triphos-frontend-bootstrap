#!/usr/bin/env node

import { readFileSync } from 'node:fs';

import {
  formatVerificationFailureMessage,
  hasRelevantChanges,
  listChangedFiles,
  makePathMatchers,
  parseStopHookInput,
  runVerification,
} from './stop-verify-lib.mjs';

const payload = parseStopHookInput(readFileSync(0, 'utf8'));
const changedFiles = listChangedFiles(process.cwd());
const relevantMatchers = makePathMatchers({
  directories: ['src', 'scripts', 'docs', '.codex', '.claude'],
  exact: [
    'scripts/verify-api-baseline.mjs',
    'scripts/verify-fsd.mjs',
    'scripts/verify-react-rules.mjs',
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    '.env',
    '.env.local',
    '.env.development.local',
    '.env.production.local',
    'AGENTS.md',
    'AGENTS.en.md',
    'CLAUDE.md',
    'CLAUDE.en.md',
  ],
});

if (payload?.stop_hook_active) {
  process.stdout.write(
    JSON.stringify({
      continue: false,
      systemMessage:
        'Triphos frontend stop hook already continued once. Skipping another automatic retry to avoid a hook loop.',
    }),
  );
  process.exit(0);
}

if (Array.isArray(changedFiles) && !hasRelevantChanges(changedFiles, relevantMatchers)) {
  process.exit(0);
}

const result = runVerification(process.cwd(), 'pnpm', ['verify:frontend']);

if (result.status === 0) {
  process.exit(0);
}

const reason = formatVerificationFailureMessage('frontend', 'pnpm verify:frontend', result);

process.stdout.write(
  JSON.stringify({
    decision: 'block',
    reason,
  }),
);

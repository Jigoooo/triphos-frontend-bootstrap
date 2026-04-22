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
const relevantMatchers = makePathMatchers([
  'plugins/triphos-frontend-bootstrap',
  'scripts',
  'tests',
  '.codex',
  '.claude',
  '.claude-plugin',
  '.agents/plugins',
  'README.md',
  'README.ko.md',
  'AGENTS.md',
  'CLAUDE.md',
  'package.json',
  'bin/triphos-frontend-bootstrap',
]);

if (payload?.stop_hook_active) {
  process.stdout.write(
    JSON.stringify({
      continue: false,
      systemMessage:
        'Triphos repository stop hook already continued once. Skipping another automatic retry to avoid a hook loop.',
    }),
  );
  process.exit(0);
}

if (Array.isArray(changedFiles) && !hasRelevantChanges(changedFiles, relevantMatchers)) {
  process.exit(0);
}

const result = runVerification(process.cwd(), 'pnpm', ['verify:repo']);

if (result.status === 0) {
  process.exit(0);
}

const reason = formatVerificationFailureMessage('repository', 'pnpm verify:repo', result);
process.stderr.write(`${reason}\n`);
process.exit(2);

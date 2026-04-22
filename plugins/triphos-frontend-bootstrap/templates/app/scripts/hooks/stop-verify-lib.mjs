#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

export function parseStopHookInput(rawInput) {
  if (!rawInput || rawInput.trim().length === 0) return null;

  try {
    const parsed = JSON.parse(rawInput);
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeStatusPath(rawPath) {
  if (!rawPath) return null;
  const trimmed = rawPath.trim();
  const renameSeparator = ' -> ';
  if (trimmed.includes(renameSeparator)) {
    return trimmed.split(renameSeparator).at(-1) ?? null;
  }
  return trimmed;
}

export function listChangedFiles(cwd) {
  const result = spawnSync('git', ['status', '--porcelain', '--untracked-files=all'], {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    return null;
  }

  return result.stdout
    .split('\n')
    .map((line) => normalizeStatusPath(line.slice(3)))
    .filter((item) => Boolean(item));
}

export function hasRelevantChanges(changedFiles, matchers) {
  return changedFiles.some((filePath) =>
    matchers.some((matcher) => matcher(filePath)),
  );
}

export function makePathMatchers({ exact = [], directories = [], prefixes = [] }) {
  return [
    ...exact.map((value) => (filePath) => filePath === value),
    ...directories.map((directory) => (filePath) => {
      return filePath === directory || filePath.startsWith(`${directory}/`);
    }),
    ...prefixes.map((prefix) => (filePath) => filePath.startsWith(prefix)),
  ];
}

export function runVerification(cwd, command, args) {
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  });
}

export function formatVerificationFailureMessage(scope, verifyCommand, result) {
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  return [
    `Triphos ${scope} verification failed.`,
    `Run ${verifyCommand} manually after fixing the reported issues.`,
    output,
  ]
    .filter(Boolean)
    .join('\n');
}

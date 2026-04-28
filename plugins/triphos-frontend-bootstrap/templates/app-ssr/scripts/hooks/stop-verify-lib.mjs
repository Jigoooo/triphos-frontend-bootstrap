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

// 4KB cap on the truncated message that lands in the agent transcript.
// The full output is preserved in the trace JSONL when `traceLogPath` is
// supplied, so cap-loss is recoverable.
const TRUNCATION_BYTE_BUDGET = 4096;
const ERROR_LINE_PATTERN = /(FAIL|Error\b|error TS\d+|✘|✗|Failed to|throws?|TypeError|ReferenceError)/iu;

export function formatVerificationFailureMessage(scope, verifyCommand, result, traceLogPath) {
  const stdout = (result.stdout ?? '').toString();
  const stderr = (result.stderr ?? '').toString();
  const combined = [stdout, stderr].filter(Boolean).join('\n');
  const truncated = truncateForTranscript(combined);
  const lines = [
    `Triphos ${scope} verification failed.`,
    `Run ${verifyCommand} manually after fixing the reported issues.`,
  ];
  if (traceLogPath) lines.push(`Full log: ${traceLogPath}`);
  if (truncated) lines.push(truncated);
  return lines.filter(Boolean).join('\n');
}

export function truncateForTranscript(rawOutput, byteBudget = TRUNCATION_BYTE_BUDGET) {
  const trimmed = (rawOutput ?? '').trim();
  if (!trimmed) return '';
  if (Buffer.byteLength(trimmed, 'utf8') <= byteBudget) return trimmed;

  const allLines = trimmed.split('\n');
  // Tier 1: extract up to 20 lines that match error signatures so the
  // root cause survives truncation even when it appears past line 40.
  const errorLines = [];
  for (const line of allLines) {
    if (ERROR_LINE_PATTERN.test(line)) {
      errorLines.push(line);
      if (errorLines.length >= 20) break;
    }
  }
  // Tier 2: head 10 + tail 10 to keep the failure context the user
  // expects without dumping the whole pipeline output.
  const head = allLines.slice(0, 10);
  const tail = allLines.slice(-10);
  const sections = [];
  if (errorLines.length > 0) sections.push(['Error lines:', ...errorLines].join('\n'));
  if (head.length > 0) sections.push(['Head:', ...head].join('\n'));
  if (tail.length > 0 && tail !== head) sections.push(['Tail:', ...tail].join('\n'));
  sections.push(`(truncated, ${Buffer.byteLength(trimmed, 'utf8')} bytes total)`);

  // Tier 3: enforce the byte budget even if the structured selection is
  // still too large (extremely long single error lines).
  let assembled = sections.join('\n---\n');
  while (Buffer.byteLength(assembled, 'utf8') > byteBudget) {
    if (sections.length <= 1) {
      const sliceEnd = byteBudget - 32;
      assembled = `${assembled.slice(0, sliceEnd)}\n(truncated)`;
      break;
    }
    sections.pop();
    assembled = sections.join('\n---\n');
  }
  return assembled;
}

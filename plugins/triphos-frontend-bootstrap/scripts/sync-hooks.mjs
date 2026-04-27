#!/usr/bin/env node
//
// sync-hooks.mjs — re-sync the runtime harness hooks (`scripts/hooks/*.mjs`,
// `.codex/hooks.json`, `.claude/settings.json`) of an init-ed Triphos repo
// against the current plugin templates. Without this, plugin upgrades silently
// leave user repos with stale hook logic (the audit issue C-9 / P0).
//
// Usage:
//   node sync-hooks.mjs --target <user-repo> [--variant app|app-ssr] [--apply] [--json]
//
//   --target   Required. Path to the user repo to compare/update.
//   --variant  Optional. `app` or `app-ssr`. Auto-detected from the target
//              package.json deps when not provided (presence of
//              `@tanstack/react-start` flips on `app-ssr`).
//   --apply    Write template content over drifted files. Without this flag
//              the script runs in diff/report mode (default = read-only).
//              `--apply` requires a clean git working tree on the target.
//   --json     Emit a machine-readable summary instead of a human report.
//
// Exit codes:
//   0  no drift detected (or --apply succeeded with all files updated)
//   1  drift detected in dry-run mode (caller must rerun with --apply)
//   2  invalid arguments / target / dirty working tree

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(__dirname, '..');

const SYNCED_FILES = [
  'scripts/hooks/claude-session-start.mjs',
  'scripts/hooks/claude-stop-verify.mjs',
  'scripts/hooks/codex-session-start.mjs',
  'scripts/hooks/codex-stop-verify.mjs',
  'scripts/hooks/stop-verify-lib.mjs',
  '.codex/hooks.json',
  '.claude/settings.json',
];

function parseArgs(argv) {
  const args = { _flags: new Set() };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args._flags.add(key);
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

function fail(message, code = 2) {
  console.error(`[sync-hooks] ${message}`);
  process.exit(code);
}

function detectVariant(targetRoot) {
  const pkgPath = resolve(targetRoot, 'package.json');
  if (!existsSync(pkgPath)) {
    fail(`target has no package.json: ${pkgPath}`);
  }
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  return deps['@tanstack/react-start'] ? 'app-ssr' : 'app';
}

function isWorkingTreeClean(cwd) {
  const result = spawnSync('git', ['status', '--porcelain'], { cwd, encoding: 'utf8' });
  if (result.status !== 0) return null;
  return result.stdout.trim().length === 0;
}

function readMaybe(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

const args = parseArgs(process.argv.slice(2));
const targetArg = typeof args.target === 'string' ? args.target : null;
if (!targetArg) {
  fail('Usage: node sync-hooks.mjs --target <user-repo> [--variant app|app-ssr] [--apply] [--json]');
}
const target = resolve(process.cwd(), targetArg);
if (!existsSync(target)) {
  fail(`target path does not exist: ${target}`);
}

const variantArg = typeof args.variant === 'string' ? args.variant : null;
if (variantArg && variantArg !== 'app' && variantArg !== 'app-ssr') {
  fail(`unsupported --variant: ${variantArg} (expected app or app-ssr)`);
}
const variant = variantArg ?? detectVariant(target);
const templateRoot = resolve(pluginRoot, 'templates', variant);
if (!existsSync(templateRoot)) {
  fail(`template directory missing: ${templateRoot}`);
}

const apply = args._flags.has('apply');
const json = args._flags.has('json');

if (apply) {
  const clean = isWorkingTreeClean(target);
  if (clean === null) {
    fail(`target is not a git repository: ${target}`);
  }
  if (!clean) {
    fail(`target git working tree is not clean — commit or stash before --apply`);
  }
}

const drift = [];
for (const relPath of SYNCED_FILES) {
  const templatePath = resolve(templateRoot, relPath);
  const targetPath = resolve(target, relPath);
  const templateContent = readMaybe(templatePath);
  if (templateContent === null) {
    drift.push({ file: relPath, status: 'template-missing' });
    continue;
  }
  const targetContent = readMaybe(targetPath);
  if (targetContent === null) {
    drift.push({ file: relPath, status: 'missing', size: templateContent.length });
    continue;
  }
  if (templateContent !== targetContent) {
    drift.push({
      file: relPath,
      status: 'drift',
      templateBytes: templateContent.length,
      targetBytes: targetContent.length,
    });
  }
}

let applied = 0;
if (apply) {
  for (const entry of drift) {
    if (entry.status === 'template-missing') continue;
    const templateContent = readFileSync(resolve(templateRoot, entry.file), 'utf8');
    writeFileSync(resolve(target, entry.file), templateContent, 'utf8');
    applied += 1;
  }
}

const summary = {
  variant,
  target: relative(process.cwd(), target) || '.',
  templateRoot: relative(process.cwd(), templateRoot),
  driftCount: drift.length,
  applied,
  drift,
};

if (json) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log(`[sync-hooks] variant=${variant} target=${summary.target}`);
  if (drift.length === 0) {
    console.log('[sync-hooks] all hooks already match the template — no drift.');
  } else {
    console.log(`[sync-hooks] drift detected in ${drift.length} file(s):`);
    for (const entry of drift) {
      console.log(`  - ${entry.file} (${entry.status})`);
    }
    if (apply) {
      console.log(`[sync-hooks] --apply wrote ${applied} file(s) from the template.`);
    } else {
      console.log('[sync-hooks] dry-run only. Re-run with --apply to overwrite drifted files.');
    }
  }
}

if (!apply && drift.length > 0) {
  process.exit(1);
}
process.exit(0);

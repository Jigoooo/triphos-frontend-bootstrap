#!/usr/bin/env node

// Measure approximate token cost of every Claude/Codex SKILL.md plus the
// reference files each one links from its body. Used as the baseline for
// the token-cost optimisation plan: run before changes to capture a
// snapshot, then re-run with --baseline <file> to assert relative
// improvement targets.
//
// Token estimator: ceil(chars / 4). Documented in
// plugins/triphos-frontend-bootstrap/scripts/README.token-baseline.md so
// the function stays stable across runs and reviewers can audit it.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const PLUGIN_ROOT = resolve(dirname(__filename), '..');
const SKILLS_ROOT = resolve(PLUGIN_ROOT, 'skills');
const SURFACES = ['claude', 'codex'];
const SCHEMA_VERSION = 1;

const args = parseArgs(process.argv.slice(2));

const measurements = [];
for (const surface of SURFACES) {
  const surfaceRoot = resolve(SKILLS_ROOT, surface);
  if (!existsSync(surfaceRoot)) continue;
  for (const skillName of listSkillDirs(surfaceRoot)) {
    const skillPath = resolve(surfaceRoot, skillName, 'SKILL.md');
    if (!existsSync(skillPath)) continue;
    measurements.push(measureSkill(surface, skillName, skillPath));
  }
}

const p50Series = measurements.map((m) => m.totalP50Tokens).sort((a, b) => a - b);
const p95Series = measurements.map((m) => m.totalP95Tokens).sort((a, b) => a - b);

const summary = {
  schemaVersion: SCHEMA_VERSION,
  generatedAt: new Date().toISOString(),
  estimator: 'Math.ceil(chars / 4)',
  skills: measurements,
  median: percentile(p50Series, 0.5),
  p95: percentile(p95Series, 0.95),
};

if (args.baseline) {
  assertImprovement(args.baseline, summary, args);
}

const out = JSON.stringify(summary, null, 2);
if (args.write) {
  const outPath = resolveOutPath(args.write);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${out}\n`, 'utf8');
  console.error(`Wrote baseline to ${outPath}`);
} else if (!args.quiet) {
  console.log(out);
}

if (!args.quiet) {
  console.error(`\nSkills measured: ${measurements.length}`);
  console.error(`Median total P50 (body only): ${summary.median} tokens`);
  console.error(`P95 total (body + immediate refs): ${summary.p95} tokens`);
}

function measureSkill(surface, skillName, skillPath) {
  const content = readNormalized(skillPath);
  const { frontmatterChars, bodyChars, bodyLines, body } = splitFrontmatter(content);
  const refs = extractMarkdownRefs(body)
    .map((rel) => ({ rel, abs: resolve(dirname(skillPath), rel) }))
    .filter((entry) => existsSync(entry.abs) && statSync(entry.abs).isFile());

  let refsChars = 0;
  const refDetails = [];
  for (const entry of refs) {
    const refContent = readNormalized(entry.abs);
    refsChars += refContent.length;
    refDetails.push({
      relPath: entry.rel,
      chars: refContent.length,
      estimatedTokens: Math.ceil(refContent.length / 4),
    });
  }

  const estimatedBodyTokens = Math.ceil(bodyChars / 4);
  const estimatedRefsTokens = Math.ceil(refsChars / 4);

  return {
    name: skillName,
    surface,
    bodyLines,
    bodyChars,
    frontmatterChars,
    estimatedBodyTokens,
    refCount: refDetails.length,
    refs: refDetails,
    refsCharsImmediate: refsChars,
    estimatedRefsTokens,
    totalP50Tokens: estimatedBodyTokens,
    totalP95Tokens: estimatedBodyTokens + estimatedRefsTokens,
  };
}

function splitFrontmatter(content) {
  if (!content.startsWith('---\n')) {
    return {
      frontmatterChars: 0,
      bodyChars: content.length,
      bodyLines: content.split('\n').length,
      body: content,
    };
  }
  const endIndex = content.indexOf('\n---\n', 4);
  if (endIndex < 0) {
    return {
      frontmatterChars: 0,
      bodyChars: content.length,
      bodyLines: content.split('\n').length,
      body: content,
    };
  }
  const body = content.slice(endIndex + 5);
  return {
    frontmatterChars: endIndex + 5,
    bodyChars: body.length,
    bodyLines: body.split('\n').length,
    body,
  };
}

function extractMarkdownRefs(body) {
  const refs = new Set();
  const linkPattern = /\[[^\]]+\]\(([^)\s]+)\)/gu;
  for (const match of body.matchAll(linkPattern)) {
    const raw = match[1].split('#')[0];
    if (!raw || /^[a-z]+:\/\//iu.test(raw) || raw.startsWith('/')) continue;
    if (extname(raw) !== '.md') continue;
    if (raw.startsWith('./') || raw.startsWith('../') || raw.startsWith('references/')) {
      refs.add(raw);
    }
  }
  return [...refs].sort();
}

function listSkillDirs(surfaceRoot) {
  return readdirSync(surfaceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function readNormalized(path) {
  return readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
}

function percentile(sortedAsc, p) {
  if (sortedAsc.length === 0) return 0;
  const idx = Math.min(sortedAsc.length - 1, Math.floor(sortedAsc.length * p));
  return sortedAsc[idx];
}

function parseArgs(argv) {
  const out = { baseline: null, write: null, assertMedian: null, assertP95: null, quiet: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--baseline') out.baseline = argv[++i];
    else if (arg === '--write') out.write = argv[++i];
    else if (arg === '--assert-median') out.assertMedian = Number(argv[++i]);
    else if (arg === '--assert-p95') out.assertP95 = Number(argv[++i]);
    else if (arg === '--quiet') out.quiet = true;
    else if (arg === '--help' || arg === '-h') printHelpAndExit();
  }
  return out;
}

function resolveOutPath(value) {
  if (value === 'auto') {
    const date = new Date().toISOString().slice(0, 10);
    return resolve(PLUGIN_ROOT, '..', '..', '.triphos', 'baselines', `${date}-skill-tokens.json`);
  }
  return resolve(process.cwd(), value);
}

function assertImprovement(baselinePath, current, opts) {
  const absPath = resolve(process.cwd(), baselinePath);
  if (!existsSync(absPath)) {
    console.error(`Baseline file not found: ${absPath}`);
    process.exit(2);
  }
  const baseline = JSON.parse(readFileSync(absPath, 'utf8'));
  const reductionMedian = (baseline.median - current.median) / Math.max(baseline.median, 1);
  const reductionP95 = (baseline.p95 - current.p95) / Math.max(baseline.p95, 1);
  console.error(
    `Median: baseline=${baseline.median} current=${current.median} reduction=${(reductionMedian * 100).toFixed(1)}%`,
  );
  console.error(
    `P95:    baseline=${baseline.p95} current=${current.p95} reduction=${(reductionP95 * 100).toFixed(1)}%`,
  );
  let failed = false;
  if (opts.assertMedian !== null && reductionMedian < opts.assertMedian) {
    console.error(`FAIL: median reduction ${(reductionMedian * 100).toFixed(1)}% below required ${(opts.assertMedian * 100).toFixed(1)}%`);
    failed = true;
  }
  if (opts.assertP95 !== null && reductionP95 < opts.assertP95) {
    console.error(`FAIL: p95 reduction ${(reductionP95 * 100).toFixed(1)}% below required ${(opts.assertP95 * 100).toFixed(1)}%`);
    failed = true;
  }
  if (failed) process.exit(1);
}

function printHelpAndExit() {
  console.error(
    [
      'Usage: measure-skill-tokens.mjs [options]',
      '',
      'Options:',
      '  --write <path|auto>   Write summary JSON. "auto" uses .triphos/baselines/<date>-skill-tokens.json',
      '  --baseline <path>     Compare current measurement against a previous baseline JSON',
      '  --assert-median <r>   With --baseline: require reduction >= r (e.g. 0.30 for 30%)',
      '  --assert-p95 <r>      With --baseline: require p95 reduction >= r',
      '  --quiet               Suppress stdout/stderr summary lines',
    ].join('\n'),
  );
  process.exit(0);
}

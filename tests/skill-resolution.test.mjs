// Asserts that every SKILL.md reference (markdown link) resolves to an
// existing file in two mock environments:
//   (a) plugin repo dev location (this repo as-is)
//   (b) marketplace install location: cpSync the plugin tree into a temp
//       directory and re-run resolution from there.
//
// Pure node:test + fs. Does NOT import Anthropic SDK or Codex CLI — those
// runtimes load skills lazily, so an fs-only check is the contract we
// rely on. If either runtime ever rejects `../../../references/...`
// escapes, this suite must be replaced with an SDK-level loader test.

import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(__filename), '..');
const PLUGIN_ROOT_DEV = resolve(REPO_ROOT, 'plugins', 'triphos-frontend-bootstrap');
const SURFACES = ['claude', 'codex'];

function listSkillPaths(pluginRoot) {
  const out = [];
  for (const surface of SURFACES) {
    const surfaceRoot = resolve(pluginRoot, 'skills', surface);
    if (!existsSync(surfaceRoot)) continue;
    for (const name of readdirSync(surfaceRoot)) {
      const skillPath = resolve(surfaceRoot, name, 'SKILL.md');
      if (existsSync(skillPath)) out.push({ surface, name, skillPath });
    }
  }
  return out;
}

function extractBody(content) {
  if (!content.startsWith('---\n')) return content;
  const endIdx = content.indexOf('\n---\n', 4);
  return endIdx < 0 ? content : content.slice(endIdx + 5);
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

function assertAllRefsResolve(pluginRoot, label) {
  const failures = [];
  const skills = listSkillPaths(pluginRoot);
  assert.ok(skills.length > 0, `${label}: no skills discovered under ${pluginRoot}`);

  for (const { surface, name, skillPath } of skills) {
    const body = extractBody(readFileSync(skillPath, 'utf8'));
    const refs = extractMarkdownRefs(body);
    for (const rel of refs) {
      const abs = resolve(dirname(skillPath), rel);
      // Reject paths that escape the plugin root: those would not survive
      // marketplace install, even if they happen to resolve in dev.
      if (!abs.startsWith(pluginRoot)) {
        failures.push(`${label}: ${surface}/${name} ref ${rel} escapes plugin root → ${abs}`);
        continue;
      }
      if (!existsSync(abs)) {
        failures.push(`${label}: ${surface}/${name} ref ${rel} missing → ${abs}`);
        continue;
      }
      if (!statSync(abs).isFile()) {
        failures.push(`${label}: ${surface}/${name} ref ${rel} is not a file`);
      }
    }
  }
  if (failures.length > 0) {
    assert.fail(`Reference resolution failures (${failures.length}):\n${failures.join('\n')}`);
  }
}

test('SKILL.md refs resolve in plugin repo (dev) location', () => {
  assertAllRefsResolve(PLUGIN_ROOT_DEV, 'dev');
});

test('SKILL.md refs resolve in marketplace install (mocked) location', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'triphos-skill-mock-'));
  try {
    const installRoot = resolve(tmp, 'plugins', 'triphos-frontend-bootstrap');
    // Skip heavy template build artifacts that the marketplace tarball
    // does not ship anyway. Cuts the cpSync from ~12s to <1s.
    const skipDirs = new Set(['node_modules', 'dist', '.output', '.vite', '.cache']);
    cpSync(PLUGIN_ROOT_DEV, installRoot, {
      recursive: true,
      filter: (src) => !skipDirs.has(src.split(/[\\/]/).pop()),
    });
    assertAllRefsResolve(installRoot, 'install');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

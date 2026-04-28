#!/usr/bin/env node

// Validates the skill-bundles contract (Step 1+5 of the token-cost
// optimisation plan):
//
// 1. Every markdown reference inside any SKILL.md must resolve to an
//    existing file under the plugin root.
// 2. References that point into `references/skill-bundles/<bundle>/` must
//    use only the common file or the file under `_surface/<own-surface>/`
//    — never `_surface/<other-surface>/`. This is the surface-divergence
//    escape hatch defined by the plan; cross-surface contamination is the
//    only thing the lint forbids.
// 3. Skill-local `references/` directories must NOT exist for any skill
//    (centralisation invariant). `scripts/` per skill is allowed; only
//    `references/` is forbidden.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const PLUGIN_ROOT = resolve(dirname(__filename), '..');
const SKILLS_ROOT = resolve(PLUGIN_ROOT, 'skills');
const SURFACES = ['claude', 'codex'];

const failures = [];

for (const surface of SURFACES) {
  const surfaceRoot = resolve(SKILLS_ROOT, surface);
  if (!existsSync(surfaceRoot)) continue;
  for (const skillName of readdirSync(surfaceRoot)) {
    const skillDir = resolve(surfaceRoot, skillName);
    if (!statSync(skillDir).isDirectory()) continue;

    const localRefsDir = resolve(skillDir, 'references');
    if (existsSync(localRefsDir)) {
      failures.push(
        `${surface}/${skillName} retains a local references/ directory; bundles must live under references/skill-bundles/`,
      );
    }

    const skillPath = resolve(skillDir, 'SKILL.md');
    if (!existsSync(skillPath)) continue;
    const body = stripFrontmatter(readNormalized(skillPath));
    for (const rel of extractMarkdownRefs(body)) {
      const abs = resolve(skillDir, rel);
      const within = relative(PLUGIN_ROOT, abs);
      if (within.startsWith('..')) {
        failures.push(`${surface}/${skillName}: ref ${rel} escapes plugin root`);
        continue;
      }
      if (!existsSync(abs) || !statSync(abs).isFile()) {
        failures.push(`${surface}/${skillName}: ref ${rel} → ${within} does not exist`);
        continue;
      }
      const surfaceMatch = within.match(/references\/skill-bundles\/[^/]+\/_surface\/([^/]+)\//u);
      if (surfaceMatch && surfaceMatch[1] !== surface) {
        failures.push(
          `${surface}/${skillName}: ref ${rel} loads ${surfaceMatch[1]}-only override (cross-surface contamination)`,
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error('Skill bundles check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Skill bundles contract verified.');

function readNormalized(path) {
  return readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
}

function stripFrontmatter(content) {
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

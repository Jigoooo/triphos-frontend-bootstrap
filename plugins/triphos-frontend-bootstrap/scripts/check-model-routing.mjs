#!/usr/bin/env node

// Asserts that every Triphos plugin agent declares the same Claude
// model in its `agents/<name>.md` frontmatter as the README routing
// table advertises. Drift between the two surfaces silently changes
// what model the user pays for, so the check is part of verify:repo.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const PLUGIN_ROOT = resolve(dirname(__filename), '..');
const REPO_ROOT = resolve(PLUGIN_ROOT, '..', '..');

const failures = [];

const agentsDir = resolve(PLUGIN_ROOT, 'agents');
const agentFiles = readdirSync(agentsDir).filter((name) => name.endsWith('.md'));
const agentModels = new Map();
for (const file of agentFiles) {
  const path = resolve(agentsDir, file);
  const content = readFileSync(path, 'utf8');
  const fm = parseFrontmatter(content);
  const name = fm.get('name') ?? file.replace(/\.md$/u, '');
  const model = fm.get('model');
  if (!model) {
    failures.push(`${file}: agents frontmatter is missing required \`model:\` key`);
    continue;
  }
  agentModels.set(name, model);
}

const readmePath = resolve(REPO_ROOT, 'README.md');
if (!existsSync(readmePath)) {
  failures.push('README.md not found at repo root');
} else {
  const readme = readFileSync(readmePath, 'utf8');
  const tableModels = parseModelRoutingTable(readme);
  if (tableModels.size === 0) {
    failures.push('README.md has no parseable Model per Agent table');
  }
  for (const [name, fmModel] of agentModels) {
    if (!tableModels.has(name)) {
      failures.push(`README.md routing table has no row for agent \`${name}\``);
      continue;
    }
    const readmeModel = tableModels.get(name);
    if (readmeModel !== fmModel) {
      failures.push(
        `agent \`${name}\` model mismatch: agents/${name}.md says \`${fmModel}\`, README.md says \`${readmeModel}\``,
      );
    }
  }
  for (const name of tableModels.keys()) {
    if (!agentModels.has(name)) {
      failures.push(`README.md table mentions \`${name}\` but no matching agents/<name>.md exists`);
    }
  }
}

if (failures.length > 0) {
  console.error('Model routing check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Model routing verified for ${agentModels.size} agents.`);

function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) return new Map();
  const end = content.indexOf('\n---\n', 4);
  if (end < 0) return new Map();
  const map = new Map();
  for (const line of content.slice(4, end).split('\n')) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/u);
    if (m) map.set(m[1], m[2].trim().replace(/^["']|["']$/gu, ''));
  }
  return map;
}

function parseModelRoutingTable(readme) {
  // The README has a single "Model per Agent" markdown table whose first
  // column is the agent name wrapped in backticks. We pick the row that
  // mentions `frontend-bootstrap-` to ignore the per-skill table below.
  const result = new Map();
  const rowPattern = /^\|\s*`(frontend-bootstrap-[a-z0-9-]+)`\s*\|\s*([a-z0-9-]+)\s*\|/gimu;
  for (const match of readme.matchAll(rowPattern)) {
    result.set(match[1], match[2]);
  }
  return result;
}

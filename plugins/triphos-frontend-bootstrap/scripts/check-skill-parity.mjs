#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pluginRoot = resolve(process.cwd(), 'plugins', 'triphos-frontend-bootstrap');
const pairedSkills = [
  'triphos-frontend-init',
  'triphos-react-lint-rules',
  'triphos-api-client-setup',
  'triphos-frontend-adopt',
];

const failures = [];

for (const skillName of pairedSkills) {
  const codexPath = resolve(pluginRoot, 'skills', 'codex', skillName, 'SKILL.md');
  const claudePath = resolve(pluginRoot, 'skills', 'claude', skillName, 'SKILL.md');
  const codexContent = readFileSync(codexPath, 'utf8').replace(/\r\n/g, '\n');
  const claudeContent = readFileSync(claudePath, 'utf8').replace(/\r\n/g, '\n');

  if (codexContent !== claudeContent) {
    failures.push(`${skillName} is not mirrored between Codex and Claude skill surfaces`);
  }
}

if (failures.length > 0) {
  console.error('Skill parity check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Skill parity verified.');

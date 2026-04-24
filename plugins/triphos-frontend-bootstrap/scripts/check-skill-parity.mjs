#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';

const pluginRoot = resolve(process.cwd(), 'plugins', 'triphos-frontend-bootstrap');
const skillsRoot = resolve(pluginRoot, 'skills');
const surfaces = ['claude', 'codex'];
const ignoredResourceDirectories = new Set(['agents']);
const localReferenceExtensions = new Set([
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.png',
  '.sh',
  '.svg',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
]);

const failures = [];

const skillNamesBySurface = Object.fromEntries(
  surfaces.map((surface) => [surface, listSkillNames(resolve(skillsRoot, surface))]),
);
const allSkillNames = [...new Set(Object.values(skillNamesBySurface).flat())].sort();

for (const skillName of allSkillNames) {
  for (const surface of surfaces) {
    const skillDir = resolve(skillsRoot, surface, skillName);
    if (!existsSync(resolve(skillDir, 'SKILL.md'))) {
      failures.push(`${surface}/${skillName} is missing SKILL.md`);
    }
  }

  const claudeDir = resolve(skillsRoot, 'claude', skillName);
  const codexDir = resolve(skillsRoot, 'codex', skillName);
  const claudeSkillPath = resolve(claudeDir, 'SKILL.md');
  const codexSkillPath = resolve(codexDir, 'SKILL.md');

  if (existsSync(claudeSkillPath) && existsSync(codexSkillPath)) {
    const claudeContent = readNormalized(claudeSkillPath);
    const codexContent = readNormalized(codexSkillPath);

    if (claudeContent !== codexContent) {
      failures.push(`${skillName}/SKILL.md is not mirrored between Claude and Codex surfaces`);
    }
  }

  compareBundledResources(skillName, claudeDir, codexDir);
}

for (const surface of surfaces) {
  for (const skillName of skillNamesBySurface[surface]) {
    const skillPath = resolve(skillsRoot, surface, skillName, 'SKILL.md');
    validateSkillFile(surface, skillName, skillPath);
  }
}

if (failures.length > 0) {
  console.error('Skill parity check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Skill parity verified for ${allSkillNames.length} skills.`);

function listSkillNames(surfaceRoot) {
  return readdirSync(surfaceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(resolve(surfaceRoot, name, 'SKILL.md')))
    .sort();
}

function readNormalized(path) {
  return readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
}

function compareBundledResources(skillName, claudeDir, codexDir) {
  const claudeFiles = listBundledFiles(claudeDir);
  const codexFiles = listBundledFiles(codexDir);
  const allFiles = [...new Set([...claudeFiles, ...codexFiles])].sort();

  for (const file of allFiles) {
    const claudePath = resolve(claudeDir, file);
    const codexPath = resolve(codexDir, file);

    if (!existsSync(claudePath)) {
      failures.push(`${skillName}/${file} exists only in Codex skill resources`);
      continue;
    }

    if (!existsSync(codexPath)) {
      failures.push(`${skillName}/${file} exists only in Claude skill resources`);
      continue;
    }

    if (readNormalized(claudePath) !== readNormalized(codexPath)) {
      failures.push(`${skillName}/${file} is not mirrored between Claude and Codex surfaces`);
    }
  }
}

function listBundledFiles(skillDir, currentDir = skillDir) {
  if (!existsSync(currentDir)) return [];

  return readdirSync(currentDir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'SKILL.md') return [];
    if (entry.isDirectory() && ignoredResourceDirectories.has(entry.name)) return [];

    const entryPath = resolve(currentDir, entry.name);
    const relativePath = relative(skillDir, entryPath).replaceAll('\\', '/');

    if (entry.isDirectory()) {
      return listBundledFiles(skillDir, entryPath);
    }

    return relativePath;
  });
}

function validateSkillFile(surface, skillName, skillPath) {
  const content = readNormalized(skillPath);
  const frontmatter = readFrontmatter(content, `${surface}/${skillName}`);

  if (!frontmatter) return;

  const declaredName = frontmatter.get('name');
  const description = frontmatter.get('description');

  if (!declaredName) {
    failures.push(`${surface}/${skillName} frontmatter is missing name`);
  } else {
    if (declaredName !== skillName) {
      failures.push(`${surface}/${skillName} frontmatter name must match directory name`);
    }
    if (declaredName.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(declaredName)) {
      failures.push(`${surface}/${skillName} frontmatter name violates Agent Skills naming rules`);
    }
  }

  if (!description || description.trim().length === 0) {
    failures.push(`${surface}/${skillName} frontmatter is missing description`);
  } else if (description.length > 1024) {
    failures.push(`${surface}/${skillName} description exceeds 1024 characters`);
  }

  for (const reference of extractLocalReferences(content)) {
    const referencePath = resolve(dirname(skillPath), reference);
    if (!existsSync(referencePath)) {
      failures.push(`${surface}/${skillName} references missing local file: ${reference}`);
    } else if (statSync(referencePath).isDirectory()) {
      failures.push(`${surface}/${skillName} references a directory instead of a file: ${reference}`);
    }
  }
}

function readFrontmatter(content, label) {
  if (!content.startsWith('---\n')) {
    failures.push(`${label} is missing YAML frontmatter`);
    return null;
  }

  const endIndex = content.indexOf('\n---\n', 4);
  if (endIndex < 0) {
    failures.push(`${label} frontmatter is not closed`);
    return null;
  }

  const frontmatter = new Map();
  for (const line of content.slice(4, endIndex).split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/u);
    if (match) {
      frontmatter.set(match[1], match[2].trim().replace(/^["']|["']$/g, ''));
    }
  }

  return frontmatter;
}

function extractLocalReferences(content) {
  const references = new Set();
  const markdownLinkPattern = /\[[^\]]+\]\(([^)]+)\)/gu;
  const inlineCodePattern = /`([^`]+)`/gu;

  for (const match of content.matchAll(markdownLinkPattern)) {
    addReferenceCandidate(references, match[1]);
  }

  for (const match of content.matchAll(inlineCodePattern)) {
    for (const token of match[1].split(/\s+/u)) {
      addReferenceCandidate(references, token);
    }
  }

  return [...references].sort();
}

function addReferenceCandidate(references, rawValue) {
  const value = rawValue
    .trim()
    .replace(/^[("'`]+/u, '')
    .replace(/[)"'`,.:;]+$/u, '')
    .split('#')[0];

  if (!value || /^[a-z]+:\/\//iu.test(value) || value.startsWith('/')) return;

  const extension = extname(value);
  if (!localReferenceExtensions.has(extension)) return;

  if (
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.startsWith('references/') ||
    value.startsWith('scripts/') ||
    value.startsWith('assets/')
  ) {
    references.add(value);
  }
}

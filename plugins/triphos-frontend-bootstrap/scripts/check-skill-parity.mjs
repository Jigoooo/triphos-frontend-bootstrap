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

const VALID_LEVELS = new Set([1, 2, 3, 4]);
const SOURCE_SKILLS = new Set([
  'triphos-frontend-init',
  'triphos-frontend-adopt',
  'triphos-fsd-refactor',
]);

const failures = [];
const warnings = [];

const skillNamesBySurface = Object.fromEntries(
  surfaces.map((surface) => [surface, listSkillNames(resolve(skillsRoot, surface))]),
);
const allSkillNames = [...new Set(Object.values(skillNamesBySurface).flat())].sort();
const knownSkills = new Set(allSkillNames);

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

    // Surface-specific frontmatter keys (e.g. `model:`, `allowed-tools:`) may
    // legitimately diverge between Claude and Codex when one runtime supports
    // a feature the other does not. Strip those keys before the equality
    // check; the rest of the SKILL must remain byte-equal.
    if (stripSurfaceSpecificFrontmatter(claudeContent) !== stripSurfaceSpecificFrontmatter(codexContent)) {
      failures.push(`${skillName}/SKILL.md is not mirrored between Claude and Codex surfaces`);
    }
  }

  compareBundledResources(skillName, claudeDir, codexDir);
}

const skillFrontmatterByName = new Map();

for (const surface of surfaces) {
  for (const skillName of skillNamesBySurface[surface]) {
    const skillPath = resolve(skillsRoot, surface, skillName, 'SKILL.md');
    const frontmatter = validateSkillFile(surface, skillName, skillPath);
    if (surface === 'claude' && frontmatter) {
      skillFrontmatterByName.set(skillName, frontmatter);
    }
  }
}

validateCrossReferences(skillFrontmatterByName);

if (failures.length > 0) {
  console.error('Skill parity check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn('Skill parity warnings:');
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
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

function stripSurfaceSpecificFrontmatter(content) {
  // Surface-specific keys (Claude `model:`, Claude `allowed-tools:`) may
  // legitimately differ between claude/ and codex/ mirrors; strip them before
  // the byte-equal compare so adding `model: sonnet` to Claude alone does not
  // trip parity.
  const surfaceSpecific = new Set(['model', 'allowed-tools']);
  if (!content.startsWith('---\n')) return content;
  const endIndex = content.indexOf('\n---\n', 4);
  if (endIndex < 0) return content;

  const body = content.slice(endIndex + 5);
  const filtered = content
    .slice(4, endIndex)
    .split('\n')
    .filter((line) => {
      const match = line.match(/^([A-Za-z0-9_-]+):/u);
      if (!match) return true;
      return !surfaceSpecific.has(match[1]);
    })
    .join('\n');

  return `---\n${filtered}\n---\n${body}`;
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

  if (!frontmatter) return null;

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

  validateLevel(surface, skillName, frontmatter);
  validateSourceSkillFields(surface, skillName, frontmatter);

  for (const reference of extractLocalReferences(content)) {
    const referencePath = resolve(dirname(skillPath), reference);
    if (!existsSync(referencePath)) {
      failures.push(`${surface}/${skillName} references missing local file: ${reference}`);
    } else if (statSync(referencePath).isDirectory()) {
      failures.push(`${surface}/${skillName} references a directory instead of a file: ${reference}`);
    }
  }

  return frontmatter;
}

function validateLevel(surface, skillName, frontmatter) {
  const raw = frontmatter.get('level');
  if (raw === undefined) return;
  const level = Number.parseInt(raw, 10);
  if (!Number.isInteger(level) || !VALID_LEVELS.has(level)) {
    failures.push(`${surface}/${skillName} frontmatter level must be an integer in {1, 2, 3, 4} (got: ${raw})`);
  }
}

function validateSourceSkillFields(surface, skillName, frontmatter) {
  // Source skills (orchestrators) should declare next-skill / pipeline / handoff once
  // they adopt the new skeleton. Until each pilot is migrated we only enforce
  // shape, not presence. Presence requirement activates after Wave 3 completes.
  const nextSkill = frontmatter.get('next-skill');
  if (nextSkill && !knownSkills.has(nextSkill)) {
    failures.push(`${surface}/${skillName} references unknown next-skill: ${nextSkill}`);
  }

  const pipelineRaw = frontmatter.get('pipeline');
  if (pipelineRaw) {
    for (const target of parseInlineArray(pipelineRaw)) {
      if (!knownSkills.has(target)) {
        failures.push(`${surface}/${skillName} pipeline references unknown skill: ${target}`);
      }
    }
  }
}

function validateCrossReferences(claudeFrontmatterByName) {
  for (const [skillName, frontmatter] of claudeFrontmatterByName) {
    const myLevelRaw = frontmatter.get('level');
    if (!myLevelRaw) continue;
    const myLevel = Number.parseInt(myLevelRaw, 10);
    if (!Number.isInteger(myLevel)) continue;

    const nextSkill = frontmatter.get('next-skill');
    if (nextSkill && knownSkills.has(nextSkill)) {
      const targetFm = claudeFrontmatterByName.get(nextSkill);
      const targetLevelRaw = targetFm?.get('level');
      const targetLevel = targetLevelRaw ? Number.parseInt(targetLevelRaw, 10) : null;
      if (Number.isInteger(targetLevel) && targetLevel > myLevel) {
        warnings.push(
          `${skillName} (level ${myLevel}) chains to higher-level skill ${nextSkill} (level ${targetLevel}) — orchestrators normally chain downward`,
        );
      }
    }

    if (SOURCE_SKILLS.has(skillName) && !nextSkill && !frontmatter.get('pipeline')) {
      warnings.push(`${skillName} is a source skill but declares neither next-skill nor pipeline`);
    }
  }
}

function parseInlineArray(value) {
  // Accepts flow-style arrays `[a, b, "c"]`. Returns string[] of trimmed items.
  const trimmed = value.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    // Tolerate a single bare token like `pipeline: foo` even though we recommend arrays.
    return trimmed ? [trimmed.replace(/^["']|["']$/gu, '')] : [];
  }
  return trimmed
    .slice(1, -1)
    .split(',')
    .map((item) => item.trim().replace(/^["']|["']$/gu, ''))
    .filter(Boolean);
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
  // Only markdown links count as references. Inline code (`backticks`) is
  // documentation prose, not a load-this-file directive — treating it as a
  // ref produced false positives for tokens like `verify-a11y.mjs` that
  // describe generated-app scripts. The skill-bundles centralisation
  // (Step 1) further means refs always live in one canonical location;
  // body inline mentions can describe the file without binding the path.
  const references = new Set();
  const markdownLinkPattern = /\[[^\]]+\]\(([^)\s]+)\)/gu;

  for (const match of content.matchAll(markdownLinkPattern)) {
    addReferenceCandidate(references, match[1]);
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

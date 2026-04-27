#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const appRoot = process.cwd();
const routesRoot = resolve(appRoot, 'src/routes');
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function listRouteFiles(rootDir) {
  const queue = [rootDir];
  const files = [];
  while (queue.length > 0) {
    const current = queue.pop();
    if (!current) continue;
    for (const entry of readdirSync(current)) {
      const fullPath = resolve(current, entry);
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        queue.push(fullPath);
      } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

const NON_PAGE_BASENAMES = new Set([
  '__root.tsx',
  '__root.ts',
  'sitemap[.]xml.ts',
  'llms[.]txt.ts',
  'llms-full[.]txt.ts',
  'robots[.]txt.ts',
  'routeTree.gen.ts',
]);

function isPageRoute(file) {
  const base = file.split('/').pop() ?? '';
  return !NON_PAGE_BASENAMES.has(base);
}

function hasHeadDefinition(content) {
  return /\bhead\s*:\s*\(/.test(content) || /\bhead\s*\(/.test(content);
}

// `buildMeta` is the canonical helper that emits title + description + OG +
// Twitter + canonical link in one call. The heuristic insists on real args
// (title:, description:, path:) so that an accidentally emptied call site
// (e.g. `buildMeta({})`) still trips the verifier.
function callsBuildMetaWithRequiredArgs(content) {
  const callRe = /buildMeta\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
  let match;
  while ((match = callRe.exec(content)) !== null) {
    const body = match[1];
    if (/\btitle\s*:/.test(body) && /\bdescription\s*:/.test(body) && /\bpath\s*:/.test(body)) {
      return true;
    }
  }
  return false;
}

function hasMetaTitle(content) {
  return /\btitle\b\s*:/.test(content) || callsBuildMetaWithRequiredArgs(content);
}

function hasMetaDescription(content) {
  return /name\s*:\s*['"]description['"]/.test(content) || callsBuildMetaWithRequiredArgs(content);
}

function rootHasOgTags(content) {
  const ogProps = ['og:title', 'og:description', 'og:type', 'og:image', 'og:url'];
  const matched = ogProps.filter((prop) => content.includes(prop));
  return matched.length >= 3 || callsBuildMetaWithRequiredArgs(content);
}

function rootHasTwitterCard(content) {
  return /twitter:card/.test(content) || callsBuildMetaWithRequiredArgs(content);
}

function rootHasJsonLd(content) {
  return /application\/ld\+json/.test(content) || /jsonLdScript\s*\(/.test(content);
}

const allRouteFiles = listRouteFiles(routesRoot);

const rootFile = allRouteFiles.find((f) => f.endsWith('/__root.tsx'));
if (!rootFile) {
  errors.push('src/routes/__root.tsx is required');
} else {
  const rootContent = readFileSync(rootFile, 'utf8');
  expect(hasHeadDefinition(rootContent), '__root.tsx must define head()');
  expect(rootHasOgTags(rootContent), '__root.tsx must include 3+ OG tags (or call buildMeta with title/description/path)');
  expect(rootHasTwitterCard(rootContent), '__root.tsx must include twitter:card (or call buildMeta with title/description/path)');
  expect(rootHasJsonLd(rootContent), '__root.tsx must include JSON-LD (jsonLdScript or application/ld+json)');
}

for (const file of allRouteFiles) {
  if (!isPageRoute(file)) continue;
  const rel = file.replace(`${appRoot}/`, '');
  const content = readFileSync(file, 'utf8');
  if (!/createFileRoute\s*\(/.test(content)) continue;
  expect(hasHeadDefinition(content), `${rel}: page route must define head()`);
  expect(
    hasMetaTitle(content),
    `${rel}: page head must include title (or call buildMeta with title/description/path)`,
  );
  expect(
    hasMetaDescription(content),
    `${rel}: page head must include description (or call buildMeta with title/description/path)`,
  );
}

if (errors.length > 0) {
  console.error('SEO check failed:');
  for (const message of errors) console.error(`- ${message}`);
  process.exit(1);
}

console.log('SEO baseline verified.');

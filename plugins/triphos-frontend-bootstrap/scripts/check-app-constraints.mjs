#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = value;
    index += 1;
  }
  return args;
}

function collectFiles(rootDir) {
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
      } else {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function parseDotEnv(content) {
  const values = {};

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    values[key] = value;
  }

  return values;
}

const args = parseArgs(process.argv.slice(2));
const target = args.target ? resolve(process.cwd(), args.target) : null;

if (!target) {
  console.error('Usage: node check-app-constraints.mjs --target <app-root>');
  process.exit(1);
}

const requiredFiles = [
  'AGENTS.md',
  'AGENTS.en.md',
  'CLAUDE.md',
  'CLAUDE.en.md',
  '.env',
  '.gitignore',
  'package.json',
  'vite.config.ts',
  'src/app/providers/api-bootstrap.ts',
  'src/shared/lib/api/api-url.ts',
  'src/shared/theme/index.ts',
  'src/shared/constants/index.ts',
  'src/shared/types/index.ts',
  'src/vite-env.d.ts',
  'src/pages/starter/ui/starter-page.tsx',
];

const missing = requiredFiles.filter((relativePath) => !existsSync(resolve(target, relativePath)));
if (missing.length > 0) {
  console.error('Missing required scaffold files:');
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

const errors = [];

function expect(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function expectTextIncludes(content, snippet, message) {
  expect(content.includes(snippet), message);
}

const forbiddenPaths = [
  'src/shared/adapter',
  'src/shared/lib/dev/mock-api-adapter.ts',
  'src/shared/lib/dev/runtime-env.ts',
];

for (const relativePath of forbiddenPaths) {
  expect(!existsSync(resolve(target, relativePath)), `Forbidden scaffold path still exists: ${relativePath}`);
}

const envValues = parseDotEnv(readFileSync(resolve(target, '.env'), 'utf8'));
expect(envValues.VITE_PORT === '3000', 'Expected .env VITE_PORT=3000');
expect(envValues.VITE_API_ORIGIN === 'http://localhost:3001', 'Expected .env VITE_API_ORIGIN=http://localhost:3001');
expect(envValues.VITE_API_PREFIX === '/api', 'Expected .env VITE_API_PREFIX=/api');

const gitignore = readFileSync(resolve(target, '.gitignore'), 'utf8');
for (const entry of ['.env.local', '.env.development.local', '.env.production.local']) {
  expectTextIncludes(gitignore, entry, `Expected .gitignore to include ${entry}`);
}

const packageJson = JSON.parse(readFileSync(resolve(target, 'package.json'), 'utf8'));
expect(packageJson.scripts?.dev === 'vite dev', 'Expected package.json scripts.dev to stay "vite dev"');
expect(packageJson.scripts?.build === 'vite build', 'Expected package.json scripts.build to stay "vite build"');
expect(packageJson.scripts?.preview === 'vite preview', 'Expected package.json scripts.preview to stay "vite preview"');
expect(packageJson.scripts?.prd === 'vite build', 'Expected package.json scripts.prd to be "vite build"');
expect(!packageJson.scripts?.prd?.includes('--mode'), 'Expected package.json scripts.prd to avoid custom Vite modes');

const viteConfig = readFileSync(resolve(target, 'vite.config.ts'), 'utf8');
expectTextIncludes(viteConfig, "loadEnv(mode, process.cwd(), 'VITE_')", 'Expected vite.config.ts to load env via loadEnv(mode, process.cwd(), "VITE_")');
expectTextIncludes(viteConfig, "const apiOrigin = env.VITE_API_ORIGIN || 'http://localhost:3001';", 'Expected vite.config.ts to derive apiOrigin from VITE_API_ORIGIN');
expectTextIncludes(viteConfig, "const apiPrefix = env.VITE_API_PREFIX || '/api';", 'Expected vite.config.ts to derive apiPrefix from VITE_API_PREFIX');
expectTextIncludes(viteConfig, 'port: Number(env.VITE_PORT || 3000)', 'Expected vite.config.ts server.port to come from VITE_PORT');
expectTextIncludes(viteConfig, '[apiPrefix]: {', 'Expected vite.config.ts server.proxy to key off apiPrefix');
expectTextIncludes(viteConfig, 'target: apiOrigin', 'Expected vite.config.ts server.proxy target to use apiOrigin');
expectTextIncludes(viteConfig, 'changeOrigin: true', 'Expected vite.config.ts server.proxy to enable changeOrigin');
expect(!viteConfig.includes('global: \'globalThis\''), 'Expected vite.config.ts to remove the global define shim');

const apiUrl = readFileSync(resolve(target, 'src/shared/lib/api/api-url.ts'), 'utf8');
expectTextIncludes(apiUrl, 'VITE_API_ORIGIN', 'Expected api-url.ts to use VITE_API_ORIGIN');
expectTextIncludes(apiUrl, 'VITE_API_PREFIX', 'Expected api-url.ts to use VITE_API_PREFIX');

const apiBootstrap = readFileSync(resolve(target, 'src/app/providers/api-bootstrap.ts'), 'utf8');
expectTextIncludes(apiBootstrap, 'initApi({', 'Expected api-bootstrap.ts to initialize @jigoooo/api-client');
expectTextIncludes(apiBootstrap, 'baseURL: import.meta.env.DEV ? import.meta.env.VITE_API_PREFIX || \'/api\' : API_BASE_URL', 'Expected api-bootstrap.ts to proxy in dev and use absolute URL in prod');

const viteEnv = readFileSync(resolve(target, 'src/vite-env.d.ts'), 'utf8');
for (const key of ['VITE_PORT', 'VITE_API_ORIGIN', 'VITE_API_PREFIX']) {
  expectTextIncludes(viteEnv, key, `Expected vite-env.d.ts to declare ${key}`);
}

const allowlist = [
  /overlay-scrollbar/i,
];

const srcRoot = resolve(target, 'src');
const files = collectFiles(srcRoot).filter((file) => file.endsWith('.ts') || file.endsWith('.tsx'));
const classNameUsages = [];
const forbiddenPatterns = [
  /\bVITE_DEV_API_URL\b/u,
  /\bVITE_PRODUCTION_API_URL\b/u,
  /\bVITE_USE_DEV_MOCKS\b/u,
  /\bapiWithAdapter\b/u,
  /\bmockApiAdapter\b/u,
  /\bshouldUseDevMocks\b/u,
  /\bcanUseDevMockWorker\b/u,
  /\bAdapterResponseType\b/u,
  /\bApiArgs\b/u,
  /\bRawApiResponse\b/u,
];

for (const file of files) {
  if (allowlist.some((pattern) => pattern.test(file))) continue;
  const content = readFileSync(file, 'utf8');
  if (content.includes('className')) {
    classNameUsages.push(file);
  }

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      errors.push(`Forbidden scaffold symbol ${pattern} detected in ${file}`);
    }
  }
}

if (classNameUsages.length > 0) {
  console.error('Disallowed className usage detected:');
  for (const item of classNameUsages) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

if (errors.length > 0) {
  console.error('App constraints failed:');
  for (const item of errors) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log(`App constraints passed: ${target}`);

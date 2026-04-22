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
  '.codex/hooks.json',
  '.claude/settings.json',
  '.env',
  '.gitignore',
  'package.json',
  'scripts/verify-fsd.mjs',
  'scripts/verify-react-rules.mjs',
  'scripts/verify-api-baseline.mjs',
  'vite.config.ts',
  'src/app/providers/api-bootstrap.ts',
  'src/shared/api/index.ts',
  'src/shared/api/lib/api-url.ts',
  'src/entities/auth/index.ts',
  'src/entities/member/index.ts',
  'src/entities/auth/model/query-keys.ts',
  'src/entities/auth/model/query-options.ts',
  'src/entities/auth/model/mutation-options.ts',
  'src/entities/member/model/query-keys.ts',
  'src/entities/member/model/query-options.ts',
  'src/entities/member/model/mutation-options.ts',
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
expect(envValues.VITE_API_URL === 'http://localhost', 'Expected .env VITE_API_URL=http://localhost');
expect(envValues.VITE_API_PORT === '3001', 'Expected .env VITE_API_PORT=3001');
expect(envValues.VITE_SUFFIX_API_ENDPOINT === 'api', 'Expected .env VITE_SUFFIX_API_ENDPOINT=api');

const gitignore = readFileSync(resolve(target, '.gitignore'), 'utf8');
for (const entry of ['.env.local', '.env.development.local', '.env.production.local']) {
  expectTextIncludes(gitignore, entry, `Expected .gitignore to include ${entry}`);
}

const packageJson = JSON.parse(readFileSync(resolve(target, 'package.json'), 'utf8'));
expect(packageJson.scripts?.dev === 'vite dev', 'Expected package.json scripts.dev to stay "vite dev"');
expect(packageJson.scripts?.build === 'vite build', 'Expected package.json scripts.build to stay "vite build"');
expect(packageJson.scripts?.preview === 'vite preview', 'Expected package.json scripts.preview to stay "vite preview"');
expect(packageJson.scripts?.prd === 'vite build', 'Expected package.json scripts.prd to be "vite build"');
expect(packageJson.dependencies?.['@lukemorales/query-key-factory'], 'Expected package.json to include @lukemorales/query-key-factory');
expect(packageJson.scripts?.['verify:fsd'] === 'node ./scripts/verify-fsd.mjs', 'Expected package.json scripts.verify:fsd');
expect(packageJson.scripts?.['verify:react-rules'] === 'node ./scripts/verify-react-rules.mjs', 'Expected package.json scripts.verify:react-rules');
expect(packageJson.scripts?.['verify:api'] === 'node ./scripts/verify-api-baseline.mjs', 'Expected package.json scripts.verify:api');
expect(packageJson.scripts?.['verify:frontend']?.includes('pnpm verify:fsd'), 'Expected package.json scripts.verify:frontend');
expect(!packageJson.scripts?.prd?.includes('--mode'), 'Expected package.json scripts.prd to avoid custom Vite modes');

const viteConfig = readFileSync(resolve(target, 'vite.config.ts'), 'utf8');
expectTextIncludes(viteConfig, "loadEnv(mode, process.cwd(), 'VITE_')", 'Expected vite.config.ts to load env via loadEnv(mode, process.cwd(), "VITE_")');
expectTextIncludes(viteConfig, "const apiUrl = env['VITE_API_URL'] || 'http://localhost';", 'Expected vite.config.ts to derive apiUrl from VITE_API_URL');
expectTextIncludes(viteConfig, "const apiPort = env['VITE_API_PORT'] || '3001';", 'Expected vite.config.ts to derive apiPort from VITE_API_PORT');
expectTextIncludes(viteConfig, "const apiSuffix = (env['VITE_SUFFIX_API_ENDPOINT'] || 'api').replace(/^\\/+", 'Expected vite.config.ts to derive apiSuffix from VITE_SUFFIX_API_ENDPOINT');
expectTextIncludes(viteConfig, "port: Number(env['VITE_PORT'] || 3000)", 'Expected vite.config.ts server.port to come from VITE_PORT');
expectTextIncludes(viteConfig, '[apiPrefix]: {', 'Expected vite.config.ts server.proxy to key off apiPrefix');
expectTextIncludes(viteConfig, 'target: apiOrigin', 'Expected vite.config.ts server.proxy target to use apiOrigin');
expectTextIncludes(viteConfig, 'changeOrigin: true', 'Expected vite.config.ts server.proxy to enable changeOrigin');
expect(!viteConfig.includes('global: \'globalThis\''), 'Expected vite.config.ts to remove the global define shim');

const sharedApi = readFileSync(resolve(target, 'src/shared/api/index.ts'), 'utf8');
expectTextIncludes(sharedApi, 'apiWithAdapter', 'Expected shared/api public API to export apiWithAdapter');

const sharedApiUrl = readFileSync(resolve(target, 'src/shared/api/lib/api-url.ts'), 'utf8');
expectTextIncludes(sharedApiUrl, 'getApiBasePath', 'Expected shared/api/lib/api-url.ts to export getApiBasePath');
expectTextIncludes(sharedApiUrl, 'getProductionApiBaseUrl', 'Expected shared/api/lib/api-url.ts to export getProductionApiBaseUrl');

const apiBootstrap = readFileSync(resolve(target, 'src/app/providers/api-bootstrap.ts'), 'utf8');
expectTextIncludes(apiBootstrap, 'initApi({', 'Expected api-bootstrap.ts to initialize @jigoooo/api-client');
for (const snippet of [
  'shouldSkipAuth',
  'getToken',
  'refreshTokenFn',
  "transformRequest: 'snakeCase'",
  "transformResponse: 'camelCase'",
  'onUnauthorized',
  'retryConfig',
  'PUBLIC_AUTH_PATH',
  'tokenActions',
  'meActions',
]) {
  expectTextIncludes(apiBootstrap, snippet, `Expected api-bootstrap.ts to include ${snippet}`);
}

const authApi = readFileSync(resolve(target, 'src/entities/auth/api/auth-api.ts'), 'utf8');
expectTextIncludes(authApi, 'apiWithAdapter', 'Expected authApi to use apiWithAdapter');
expectTextIncludes(authApi, 'PUBLIC_AUTH_PATH', 'Expected authApi to export PUBLIC_AUTH_PATH');

const authQueryKeys = readFileSync(resolve(target, 'src/entities/auth/model/query-keys.ts'), 'utf8');
expectTextIncludes(authQueryKeys, 'createQueryKeys', 'Expected auth query keys to use query-key-factory');

const authQueryOptions = readFileSync(resolve(target, 'src/entities/auth/model/query-options.ts'), 'utf8');
expectTextIncludes(authQueryOptions, 'queryOptions', 'Expected auth query options to use queryOptions');

const authMutationOptions = readFileSync(resolve(target, 'src/entities/auth/model/mutation-options.ts'), 'utf8');
expectTextIncludes(authMutationOptions, 'mutationOptions', 'Expected auth mutation options to use mutationOptions');

const memberQueryKeys = readFileSync(resolve(target, 'src/entities/member/model/query-keys.ts'), 'utf8');
expectTextIncludes(memberQueryKeys, 'createQueryKeys', 'Expected member query keys to use query-key-factory');

const memberQueryOptions = readFileSync(resolve(target, 'src/entities/member/model/query-options.ts'), 'utf8');
expectTextIncludes(memberQueryOptions, 'queryOptions', 'Expected member query options to use queryOptions');

const memberMutationOptions = readFileSync(resolve(target, 'src/entities/member/model/mutation-options.ts'), 'utf8');
expectTextIncludes(memberMutationOptions, 'mutationOptions', 'Expected member mutation options to use mutationOptions');

const viteEnv = readFileSync(resolve(target, 'src/vite-env.d.ts'), 'utf8');
for (const key of ['VITE_PORT', 'VITE_API_URL', 'VITE_API_PORT', 'VITE_SUFFIX_API_ENDPOINT']) {
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
  /\bmockApiAdapter\b/u,
  /\bshouldUseDevMocks\b/u,
  /\bcanUseDevMockWorker\b/u,
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

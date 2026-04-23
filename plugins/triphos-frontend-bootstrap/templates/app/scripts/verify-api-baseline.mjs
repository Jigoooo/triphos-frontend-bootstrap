#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';

const appRoot = process.cwd();
const srcRoot = resolve(appRoot, 'src');
const tsExtensions = new Set(['.ts', '.tsx']);
const apiMethodPattern = /\bapi\.(get|post|put|patch|delete)\s*\(/gu;
const apiClientImportPattern = /from\s*['"]@jigoooo\/api-client['"]/u;
const sharedApiInternalImportPattern = /from\s*['"]@\/shared\/api\/(adapter|wrapper|type|lib)(?:\/[^'"]*)?['"]/u;
const rawHttpPatterns = [
  /\bfetch\s*\(/u,
  /\baxios\./u,
  /import\s+(?!type\b)[\s\S]*?from\s*['"]axios(?:\/[^'"]*)?['"]/u,
];

const checks = [
  {
    file: 'src/shared/api/index.ts',
    includes: ['apiWithAdapter', 'getApiBasePath', 'getProductionApiBaseUrl'],
  },
  {
    file: 'src/shared/api/lib/api-url.ts',
    includes: ['VITE_API_URL', 'VITE_API_PORT', 'VITE_SUFFIX_API_ENDPOINT'],
  },
  {
    file: 'src/shared/api/type/api-type.ts',
    includes: ['ApiResponseType', 'AdapterResponseType'],
  },
  {
    file: 'src/shared/api/adapter/response-adapter.ts',
    includes: ['ResponseAdapter', 'adapt(code'],
  },
  {
    file: 'src/shared/api/wrapper/api-with-adapter.ts',
    includes: ['Adapter', 'ResponseAdapter', 'apiWithAdapter', 'adapt(response.status)'],
  },
  {
    file: 'src/app/providers/api-bootstrap.ts',
    includes: [
      'initApi({',
      'baseURL',
      'shouldSkipAuth',
      'getToken',
      'refreshTokenFn',
      "transformRequest: 'snakeCase'",
      "transformResponse: 'camelCase'",
      'onUnauthorized',
      'retryConfig',
    ],
  },
  {
    file: 'src/entities/auth/api/auth-api.ts',
    includes: ['apiWithAdapter', 'PUBLIC_AUTH_PATH', 'tokenRefresh', 'login'],
  },
  {
    file: 'src/entities/auth/model/query-keys.ts',
    includes: ['createQueryKeys', 'authKeys'],
  },
  {
    file: 'src/entities/auth/model/query-options.ts',
    includes: ['queryOptions', 'authQueryOptions', 'queryFn'],
  },
  {
    file: 'src/entities/auth/model/mutation-options.ts',
    includes: ['mutationOptions', 'authMutationOptions', 'mutationFn'],
  },
  {
    file: 'src/entities/auth/model/token-store.ts',
    includes: ['useTokenStore', 'tokenActions', 'setTokenAsync', 'getToken', 'reset'],
  },
  {
    file: 'src/entities/member/api/member-api.ts',
    includes: ['apiWithAdapter', 'memberApi', 'getMe', 'updateMe'],
  },
  {
    file: 'src/entities/member/model/query-keys.ts',
    includes: ['createQueryKeys', 'memberKeys'],
  },
  {
    file: 'src/entities/member/model/query-options.ts',
    includes: ['queryOptions', 'memberQueryOptions', 'queryFn'],
  },
  {
    file: 'src/entities/member/model/mutation-options.ts',
    includes: ['mutationOptions', 'memberMutationOptions', 'mutationFn'],
  },
  {
    file: 'src/entities/member/model/me-store.ts',
    includes: ['useMeStore', 'meActions', 'setMe', 'getMe', 'reset'],
  },
];

const failures = [];

function normalizePath(filePath) {
  return filePath.replaceAll('\\', '/');
}

function matchesAny(filePath, patterns) {
  return patterns.some((pattern) => pattern.test(filePath));
}

function readRequiredFile(relativePath) {
  try {
    return readFileSync(resolve(appRoot, relativePath), 'utf8');
  } catch {
    failures.push(`${relativePath} is missing required API baseline file`);
    return null;
  }
}

function walkTypeScriptFiles(currentPath, collected = []) {
  let stats;

  try {
    stats = statSync(currentPath);
  } catch {
    return collected;
  }

  if (stats.isDirectory()) {
    for (const entry of readdirSync(currentPath)) {
      walkTypeScriptFiles(resolve(currentPath, entry), collected);
    }
    return collected;
  }

  if (tsExtensions.has(extname(currentPath))) {
    collected.push(currentPath);
  }

  return collected;
}

function hasWrappedApiCall(content, callIndex) {
  const lookbehind = content.slice(Math.max(0, callIndex - 200), callIndex);
  return /apiWithAdapter\s*<[\s\S]{1,160}>\s*\(\s*$/u.test(lookbehind);
}

function validateEntityApiFile(relativePath, content) {
  const importPattern = /import\s*\{[^}]*\bapiWithAdapter\b[^}]*\}\s*from\s*['"]@\/shared\/api['"]/su;

  if (!importPattern.test(content)) {
    failures.push(`${relativePath} must import apiWithAdapter from '@/shared/api'`);
  }

  if (/apiWithAdapter\s*\(/u.test(content)) {
    failures.push(`${relativePath} must call apiWithAdapter with an explicit response type parameter`);
  }

  const apiMethodMatches = [...content.matchAll(apiMethodPattern)];

  if (apiMethodMatches.length === 0) {
    failures.push(`${relativePath} must define at least one API client call through apiWithAdapter<T>(...)`);
    return;
  }

  for (const match of apiMethodMatches) {
    if (!hasWrappedApiCall(content, match.index ?? 0)) {
      failures.push(`${relativePath} contains raw API client call without apiWithAdapter<T>(...): ${match[0]}`);
    }
  }
}

function hasRawHttpUsage(relativePath, content) {
  if (relativePath.endsWith('.d.ts')) {
    return false;
  }

  return rawHttpPatterns.some((pattern) => pattern.test(content));
}

for (const check of checks) {
  const content = readRequiredFile(check.file);

  if (!content) continue;

  for (const snippet of check.includes) {
    if (!content.includes(snippet)) {
      failures.push(`${check.file} is missing required API baseline snippet: ${snippet}`);
    }
  }
}

const sourceFiles = walkTypeScriptFiles(srcRoot);
const entityApiFilePattern = /^src\/entities\/[^/]+\/api\/[^/]+-api\.ts$/u;
const allowedApiClientImportPaths = [
  /^src\/shared\/api\//u,
  /^src\/entities\/[^/]+\/api\//u,
  /^src\/app\/providers\/api-bootstrap\.ts$/u,
];
const allowedRawHttpPaths = [
  /^src\/shared\/lib\/dev\/mock-api-adapter\.ts$/u,
];

for (const filePath of sourceFiles) {
  const relativePath = normalizePath(relative(appRoot, filePath));
  const content = readFileSync(filePath, 'utf8');

  if (apiClientImportPattern.test(content) && !matchesAny(relativePath, allowedApiClientImportPaths)) {
    failures.push(`${relativePath} imports @jigoooo/api-client outside the approved API baseline surfaces`);
  }

  if (sharedApiInternalImportPattern.test(content) && !relativePath.startsWith('src/shared/api/')) {
    failures.push(`${relativePath} imports internal shared/api modules directly; use '@/shared/api' instead`);
  }

  if (hasRawHttpUsage(relativePath, content) && !matchesAny(relativePath, allowedRawHttpPaths)) {
    failures.push(`${relativePath} contains forbidden raw HTTP usage outside the approved API baseline`);
  }

  if (entityApiFilePattern.test(relativePath)) {
    validateEntityApiFile(relativePath, content);
  }
}

if (failures.length > 0) {
  console.error('API baseline verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('API baseline verified.');

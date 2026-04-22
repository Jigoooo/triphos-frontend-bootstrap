#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appRoot = process.cwd();

const checks = [
  {
    file: 'src/app/providers/api-bootstrap.ts',
    includes: [
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

const forbiddenPatterns = [
  /fetch\(/u,
  /axios\./u,
];

const failures = [];

for (const check of checks) {
  const content = readFileSync(resolve(appRoot, check.file), 'utf8');

  for (const snippet of check.includes) {
    if (!content.includes(snippet)) {
      failures.push(`${check.file} is missing required API baseline snippet: ${snippet}`);
    }
  }
}

for (const relativePath of ['src/entities/auth/api/auth-api.ts', 'src/entities/member/api/member-api.ts']) {
  const content = readFileSync(resolve(appRoot, relativePath), 'utf8');

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      failures.push(`${relativePath} contains forbidden raw API call pattern: ${pattern}`);
    }
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

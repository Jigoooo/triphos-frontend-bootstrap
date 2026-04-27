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
  'docs/README.md',
  'docs/architecture/README.md',
  'docs/product/README.md',
  'docs/plans/README.md',
  'docs/plans/active/.gitkeep',
  'docs/plans/completed/.gitkeep',
  'docs/decisions/README.md',
  'docs/quality/README.md',
  'docs/quality/verification-matrix.md',
  'docs/quality/visual-baseline/README.md',
  'docs/quality/visual-baseline/starter-desktop.png',
  'docs/quality/visual-baseline/starter-mobile.png',
  '.codex/hooks.json',
  '.codex/config.toml',
  '.claude/settings.json',
  '.env',
  '.gitignore',
  'package.json',
  'scripts/dev-harness.mjs',
  'scripts/capture-dom.mjs',
  'scripts/capture-screenshot.mjs',
  'scripts/verify-fsd.mjs',
  'scripts/verify-react-rules.mjs',
  'scripts/verify-api-baseline.mjs',
  'scripts/verify-plans.mjs',
  'scripts/verify-e2e.mjs',
  'scripts/verify-visual.mjs',
  'scripts/verify-uat.mjs',
  'scripts/harness/harness-lib.mjs',
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
  'src/routes/__root.tsx',
  'src/routes/index.tsx',
  'src/routes/starter.tsx',
  'tsr.config.json',
];

const variantArg = typeof args.variant === 'string' ? args.variant : null;
const isSsr =
  variantArg === 'app-ssr' ||
  (variantArg === null && target.replace(/\\/g, '/').replace(/\/$/, '').endsWith('app-ssr'));

if (isSsr) {
  requiredFiles.push('src/shared/lib/is-browser.ts', 'src/shared/hooks/lifecycle/use-mounted.ts');
}

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
for (const entry of [
  '.omx',
  '.omc',
  '.triphos',
  '.idea',
  '.vscode',
  '.zed',
  '.cursor',
  '.DS_Store',
  'Thumbs.db',
  '.env.local',
  '.env.development.local',
  '.env.production.local',
]) {
  expectTextIncludes(gitignore, entry, `Expected .gitignore to include ${entry}`);
}

const codexConfig = readFileSync(resolve(target, '.codex/config.toml'), 'utf8');
expectTextIncludes(codexConfig, 'codex_hooks = true', 'Expected .codex/config.toml to enable codex_hooks');

const agents = readFileSync(resolve(target, 'AGENTS.md'), 'utf8');
expectTextIncludes(agents, 'docs/README.md', 'Expected AGENTS.md to route to docs/README.md');
expectTextIncludes(
  agents,
  'docs/plans/active/<date>-<slug>/PLAN.md',
  'Expected AGENTS.md to describe the plan record layout',
);

const claudeGuidance = readFileSync(resolve(target, 'CLAUDE.md'), 'utf8');
expectTextIncludes(claudeGuidance, 'docs/README.md', 'Expected CLAUDE.md to route to docs/README.md');

const codexSessionStart = readFileSync(resolve(target, 'scripts/hooks/codex-session-start.mjs'), 'utf8');
expectTextIncludes(codexSessionStart, 'docs/README.md', 'Expected codex session-start hook to mention docs/README.md');

const codexStopVerify = readFileSync(resolve(target, 'scripts/hooks/codex-stop-verify.mjs'), 'utf8');
expectTextIncludes(codexStopVerify, "'docs'", 'Expected codex stop hook to treat docs changes as relevant');
expectTextIncludes(codexStopVerify, "'scripts'", 'Expected codex stop hook to treat script changes as relevant');

const packageJson = JSON.parse(readFileSync(resolve(target, 'package.json'), 'utf8'));
expect(packageJson.scripts?.dev === 'vite dev', 'Expected package.json scripts.dev to stay "vite dev"');
expect(packageJson.scripts?.['dev:harness'] === 'node ./scripts/dev-harness.mjs', 'Expected package.json scripts.dev:harness');
expect(packageJson.scripts?.build === 'vite build', 'Expected package.json scripts.build to stay "vite build"');
expect(packageJson.scripts?.preview === 'vite preview', 'Expected package.json scripts.preview to stay "vite preview"');
expect(packageJson.scripts?.prd === 'vite build', 'Expected package.json scripts.prd to be "vite build"');
expect(packageJson.dependencies?.['@lukemorales/query-key-factory'], 'Expected package.json to include @lukemorales/query-key-factory');
expect(packageJson.scripts?.['capture:dom'] === 'node ./scripts/capture-dom.mjs', 'Expected package.json scripts.capture:dom');
expect(packageJson.scripts?.['capture:screenshot'] === 'node ./scripts/capture-screenshot.mjs', 'Expected package.json scripts.capture:screenshot');
expect(packageJson.scripts?.['verify:fsd'] === 'node ./scripts/verify-fsd.mjs', 'Expected package.json scripts.verify:fsd');
expect(packageJson.scripts?.['verify:react-rules'] === 'node ./scripts/verify-react-rules.mjs', 'Expected package.json scripts.verify:react-rules');
expect(packageJson.scripts?.['verify:api'] === 'node ./scripts/verify-api-baseline.mjs', 'Expected package.json scripts.verify:api');
expect(packageJson.scripts?.['verify:plans'] === 'node ./scripts/verify-plans.mjs', 'Expected package.json scripts.verify:plans');
expect(packageJson.scripts?.['verify:e2e'] === 'node ./scripts/verify-e2e.mjs', 'Expected package.json scripts.verify:e2e');
expect(packageJson.scripts?.['verify:visual'] === 'node ./scripts/verify-visual.mjs', 'Expected package.json scripts.verify:visual');
expect(packageJson.scripts?.['verify:uat'] === 'node ./scripts/verify-uat.mjs', 'Expected package.json scripts.verify:uat');
expect(packageJson.scripts?.['routes:generate'] === 'tsr generate', 'Expected package.json scripts.routes:generate to be "tsr generate"');
expect(packageJson.devDependencies?.['@tanstack/router-cli'], 'Expected package.json to include @tanstack/router-cli devDep');
expect(packageJson.devDependencies?.['@tanstack/router-plugin'], 'Expected package.json to include @tanstack/router-plugin devDep');

if (isSsr) {
  expect(packageJson.scripts?.start === 'node .output/server/index.mjs', 'SSR package.json scripts.start must be "node .output/server/index.mjs" (Nitro Node output)');
  expect(packageJson.dependencies?.['@tanstack/react-start'], 'SSR package.json must include @tanstack/react-start dep');
  expect(packageJson.dependencies?.['@tanstack/react-router-ssr-query'], 'SSR package.json must include @tanstack/react-router-ssr-query dep');
  expect(packageJson.dependencies?.['nitro'], 'SSR package.json must include nitro dep');
  expect(packageJson.devDependencies?.['vite-tsconfig-paths'], 'SSR package.json must include vite-tsconfig-paths devDep');
}
expect(packageJson.scripts?.['verify:frontend']?.startsWith('pnpm routes:generate'), 'Expected verify:frontend to begin with pnpm routes:generate');
expect(packageJson.scripts?.['verify:frontend']?.includes('pnpm verify:fsd'), 'Expected package.json scripts.verify:frontend');
expect(packageJson.scripts?.['verify:frontend']?.includes('pnpm verify:plans'), 'Expected package.json scripts.verify:frontend to include verify:plans');
expect(packageJson.scripts?.['verify:frontend']?.includes('pnpm verify:e2e'), 'Expected package.json scripts.verify:frontend to include verify:e2e');
expect(packageJson.scripts?.['verify:frontend']?.includes('pnpm verify:visual'), 'Expected package.json scripts.verify:frontend to include verify:visual');
expect(packageJson.scripts?.['verify:frontend']?.includes('pnpm verify:uat'), 'Expected package.json scripts.verify:frontend to include verify:uat');
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

if (isSsr) {
  expectTextIncludes(viteConfig, "from '@tanstack/react-start/plugin/vite'", 'Expected SSR vite.config.ts to import tanstackStart from @tanstack/react-start/plugin/vite');
  expectTextIncludes(viteConfig, 'tanstackStart(', 'Expected SSR vite.config.ts to register tanstackStart()');
  expectTextIncludes(viteConfig, "from 'nitro/vite'", 'Expected SSR vite.config.ts to import nitro from nitro/vite');
  expectTextIncludes(viteConfig, 'nitro(', 'Expected SSR vite.config.ts to register nitro()');
  expect(!viteConfig.includes('tanstackRouter('), 'SSR vite.config.ts must not register tanstackRouter() (Start handles router plugin internally)');
} else {
  expectTextIncludes(viteConfig, "from '@tanstack/router-plugin/vite'", 'Expected vite.config.ts to import tanstackRouter from @tanstack/router-plugin/vite');
  expectTextIncludes(viteConfig, 'tanstackRouter(', 'Expected vite.config.ts to register tanstackRouter() before react()');
}

const tsrConfig = JSON.parse(readFileSync(resolve(target, 'tsr.config.json'), 'utf8'));
expect(tsrConfig.routesDirectory === './src/routes', 'Expected tsr.config.json routesDirectory to be ./src/routes');
expect(tsrConfig.generatedRouteTree === './src/routeTree.gen.ts', 'Expected tsr.config.json generatedRouteTree to be ./src/routeTree.gen.ts');

const routerEntryPath = isSsr ? 'src/router.tsx' : 'src/app/router.tsx';
const routerEntry = readFileSync(resolve(target, routerEntryPath), 'utf8');
expect(!routerEntry.includes('createRootRoute'), `${routerEntryPath} must not call createRootRoute (file-based: define it in src/routes/__root.tsx)`);
expect(!routerEntry.includes('createRoute('), `${routerEntryPath} must not call createRoute (file-based: each route lives under src/routes/)`);
expectTextIncludes(routerEntry, "from '@/routeTree.gen'", `Expected ${routerEntryPath} to import routeTree from generated @/routeTree.gen`);

if (isSsr) {
  expectTextIncludes(routerEntry, 'export function getRouter', 'SSR src/router.tsx must export getRouter() so TanStack Start can build a fresh router per request');
  expectTextIncludes(routerEntry, "from '@tanstack/react-router-ssr-query'", 'SSR src/router.tsx must import setupRouterSsrQueryIntegration from @tanstack/react-router-ssr-query');
  expect(!existsSync(resolve(target, 'src/app/router.tsx')), 'SSR template must keep router definition in src/router.tsx (TanStack Start auto-resolves it there). Remove src/app/router.tsx.');
  expect(!existsSync(resolve(target, 'src/main.tsx')), 'SSR template must not ship src/main.tsx (TanStack Start owns the entry)');
  expect(!existsSync(resolve(target, 'index.html')), 'SSR template must not ship index.html (the root route renders the document)');

  for (const seoPath of [
    'src/shared/lib/seo/index.ts',
    'src/shared/lib/seo/seo-config.ts',
    'src/shared/lib/seo/build-meta.ts',
    'src/shared/lib/seo/build-json-ld.ts',
    'src/shared/lib/seo/build-sitemap-entry.ts',
    'src/routes/sitemap[.]xml.ts',
    'src/routes/llms[.]txt.ts',
    'src/routes/llms-full[.]txt.ts',
    'src/routes/robots[.]txt.ts',
    'lighthouserc.json',
    'scripts/verify-seo.mjs',
    'scripts/verify-a11y.mjs',
    'scripts/verify-lighthouse.mjs',
  ]) {
    expect(existsSync(resolve(target, seoPath)), `SSR template must ship ${seoPath} for SEO/a11y baseline`);
  }

  const eslintConfig = readFileSync(resolve(target, 'eslint.config.js'), 'utf8');
  expectTextIncludes(eslintConfig, "from 'eslint-plugin-jsx-a11y'", 'SSR eslint.config.js must import eslint-plugin-jsx-a11y');
  expectTextIncludes(eslintConfig, 'jsxA11y.flatConfigs.recommended', 'SSR eslint.config.js must register jsxA11y.flatConfigs.recommended');

  const robotsRoute = readFileSync(resolve(target, 'src/routes/robots[.]txt.ts'), 'utf8');
  expectTextIncludes(robotsRoute, 'getBaseUrl', 'src/routes/robots[.]txt.ts must build absolute Sitemap URL via getBaseUrl helper');
  expectTextIncludes(robotsRoute, 'Sitemap:', 'src/routes/robots[.]txt.ts must include the Sitemap line');
  expect(!existsSync(resolve(target, 'public/robots.txt')), 'public/robots.txt must be removed in favour of the file-based robots route (absolute Sitemap URL standard)');

  const rootRoute = readFileSync(resolve(target, 'src/routes/__root.tsx'), 'utf8');
  expectTextIncludes(rootRoute, 'jsonLdScript', '__root.tsx must inject JSON-LD via jsonLdScript helper');
  expectTextIncludes(rootRoute, 'buildMeta', '__root.tsx must build OG/Twitter meta via buildMeta helper');

  expect(packageJson.scripts?.['verify:seo'] === 'node ./scripts/verify-seo.mjs', 'SSR package.json scripts.verify:seo must be "node ./scripts/verify-seo.mjs"');
  expect(packageJson.scripts?.['verify:a11y'] === 'node ./scripts/verify-a11y.mjs', 'SSR package.json scripts.verify:a11y must be "node ./scripts/verify-a11y.mjs"');
  expect(packageJson.scripts?.['verify:lighthouse'] === 'node ./scripts/verify-lighthouse.mjs', 'SSR package.json scripts.verify:lighthouse must be "node ./scripts/verify-lighthouse.mjs"');
  const ssrVerifyFrontend = packageJson.scripts?.['verify:frontend'] ?? '';
  expect(ssrVerifyFrontend.includes('pnpm verify:seo'), 'SSR verify:frontend chain must include pnpm verify:seo');
  expect(ssrVerifyFrontend.includes('pnpm verify:a11y'), 'SSR verify:frontend chain must include pnpm verify:a11y');
  expect(ssrVerifyFrontend.includes('pnpm verify:lighthouse'), 'SSR verify:frontend chain must include pnpm verify:lighthouse');
  expect(
    /pnpm routes:generate\s*&&\s*pnpm verify:seo\b/.test(ssrVerifyFrontend),
    'SSR verify:frontend chain must run pnpm verify:seo immediately after pnpm routes:generate so newly added routes are caught early',
  );
  expect(packageJson.devDependencies?.['eslint-plugin-jsx-a11y'], 'SSR package.json must include eslint-plugin-jsx-a11y devDep');
  expect(packageJson.devDependencies?.['@axe-core/playwright'], 'SSR package.json must include @axe-core/playwright devDep');
  expect(packageJson.devDependencies?.['@lhci/cli'], 'SSR package.json must include @lhci/cli devDep');
  expect(packageJson.devDependencies?.['lighthouse'], 'SSR package.json must include lighthouse devDep');
  expect(packageJson.devDependencies?.['playwright'], 'SSR package.json must include playwright devDep');

  const lighthouseRc = JSON.parse(readFileSync(resolve(target, 'lighthouserc.json'), 'utf8'));
  const a11yAssertion = lighthouseRc.ci?.assert?.assertions?.['categories:accessibility'];
  const a11yMinScore = Array.isArray(a11yAssertion) ? a11yAssertion[1]?.minScore : undefined;
  expect(a11yMinScore === 0.95, 'lighthouserc.json categories:accessibility minScore must be 0.95 to match the SEO threshold and the documented 0.8.0 plan');
  const seoAssertion = lighthouseRc.ci?.assert?.assertions?.['categories:seo'];
  const seoMinScore = Array.isArray(seoAssertion) ? seoAssertion[1]?.minScore : undefined;
  expect(seoMinScore === 0.95, 'lighthouserc.json categories:seo minScore must be 0.95');

  expect(existsSync(resolve(target, 'public/og-default.png')), 'SSR template must ship public/og-default.png as the default OG image (replace before launch)');

  const sitemapRoute = readFileSync(resolve(target, 'src/routes/sitemap[.]xml.ts'), 'utf8');
  expectTextIncludes(sitemapRoute, 'ENTRIES', 'src/routes/sitemap[.]xml.ts must declare an ENTRIES array consumed by buildSitemapXml');
  expectTextIncludes(sitemapRoute, 'buildSitemapXml', 'src/routes/sitemap[.]xml.ts must call buildSitemapXml from @/shared/lib/seo');

  const sitemapEntry = readFileSync(resolve(target, 'src/shared/lib/seo/build-sitemap-entry.ts'), 'utf8');
  expectTextIncludes(sitemapEntry, 'clampPriority', 'build-sitemap-entry.ts must clamp priority to the 0.0-1.0 range to keep generated sitemaps schema-valid');

  const buildMetaSrc = readFileSync(resolve(target, 'src/shared/lib/seo/build-meta.ts'), 'utf8');
  expectTextIncludes(buildMetaSrc, 'noIndex', 'build-meta.ts must implement a noIndex branch so noindex pages do not leak og/twitter/canonical');

  const verifySeo = readFileSync(resolve(target, 'scripts/verify-seo.mjs'), 'utf8');
  expectTextIncludes(verifySeo, 'callsBuildMetaWithRequiredArgs', 'verify-seo.mjs must validate that buildMeta() is called with title/description/path so empty calls fail the heuristic');
}

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
  /\bcreateBrowserRouter\b/u,
  /\bcreateHashRouter\b/u,
  /\bcreateMemoryRouter\b/u,
  /from\s+['"]react-router-dom['"]/u,
  /from\s+['"]react-router['"]/u,
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

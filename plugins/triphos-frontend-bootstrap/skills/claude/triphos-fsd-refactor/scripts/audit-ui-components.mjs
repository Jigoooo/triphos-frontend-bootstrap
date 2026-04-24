#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join, relative, resolve, sep } from 'node:path';

const DEFAULT_MAX_LINES = 200;
const DEFAULT_LIMIT = 80;
const SOURCE_EXTENSIONS = new Set(['.jsx', '.ts', '.tsx']);
const UI_EXTENSIONS = new Set(['.jsx', '.tsx']);
const IGNORED_DIRS = new Set([
  '.git',
  '.next',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
]);

const SECTION_PATTERNS = [
  ['header/actions', /(<header\b|panel__title|toolbar|actions?|ActionBar|Header)/i],
  ['summary/cards', /(Summary|Stats?|Card|Metric)/i],
  ['table/grid', /(<table\b|Table|Grid|thead|tbody|rowVirtualizer|useVirtualizer)/],
  ['list/map', /\.(map|flatMap)\s*\(/],
  ['loading', /(isPending|isLoading|Loading|loading|로드 중|로딩)/i],
  ['empty', /(isEmpty|Empty|empty|없습니다|No\s+\w+)/i],
  ['banner/alert/status', /(role=["'](?:alert|status)["']|Alert|Banner|chip|toast|warning|error)/i],
  ['dialog/modal/popup', /(Dialog|Modal|Popup|Popover|Drawer|Sheet)/],
  ['filter/search/select', /(Filter|Search|검색|Select|ComboBox|Tabs?)/],
  ['form/input', /(<form\b|Form|Input|TextArea|Checkbox|Radio)/],
];
const HOOK_RESPONSIBILITY_PATTERNS = [
  ['server-query', /\b(useQuery|queryOptions|queryClient|invalidateQueries)\b/],
  ['server-mutation', /\b(useMutation|mutationOptions|mutate|mutateAsync)\b/],
  ['filter/search/sort', /\b(filter|filters|search|sort|keyword|queryText)\b/i],
  ['pagination', /\b(page|pageIndex|pageSize|pagination|cursor|offset|limit)\b/],
  ['selection', /\b(selected|selection|checked|activeId)\b/i],
  ['ui-mode', /\b(dialog|modal|drawer|popover|open|closed|tab|viewMode|mode)\b/i],
  ['routing', /\b(useNavigate|useRouter|route|params|searchParams|pathname)\b/],
  ['form/input', /\b(useForm|form|field|input|submit|validate)\b/i],
];
const ORCHESTRATION_HOOK_PATTERN = /^use-[\w-]+-(?:page|orchestration|manager)\.tsx?$/u;

const options = {
  failOnCandidates: false,
  json: false,
  limit: DEFAULT_LIMIT,
  maxLines: DEFAULT_MAX_LINES,
};
const roots = [];

for (let index = 0; index < process.argv.slice(2).length; index += 1) {
  const arg = process.argv.slice(2)[index];
  if (arg === '--fail-on-candidates') {
    options.failOnCandidates = true;
  } else if (arg === '--json') {
    options.json = true;
  } else if (arg === '--max-lines') {
    const value = Number(process.argv.slice(2)[index + 1]);
    if (Number.isFinite(value) && value > 0) options.maxLines = value;
    index += 1;
  } else if (arg === '--limit') {
    const value = Number(process.argv.slice(2)[index + 1]);
    if (Number.isFinite(value) && value > 0) options.limit = value;
    index += 1;
  } else if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  } else {
    roots.push(arg);
  }
}

const scanRoots = roots.length > 0 ? roots : ['src'];
const files = [...new Set(scanRoots.flatMap((root) => collectSourceFiles(resolve(root))))].sort();
const reports = files.map(analyzeFile).filter((report) => report.reasons.length > 0);

reports.sort((left, right) => {
  const severityDiff = severityRank(right.severity) - severityRank(left.severity);
  if (severityDiff !== 0) return severityDiff;
  return right.lines - left.lines;
});

if (options.json) {
  console.log(JSON.stringify({ filesScanned: files.length, candidates: reports }, null, 2));
} else {
  printTextReport(files.length, reports);
}

if (options.failOnCandidates && reports.length > 0) {
  process.exit(1);
}

function printHelp() {
  console.log(`Usage: node audit-ui-components.mjs [path ...] [options]

Options:
  --json                 Print machine-readable JSON.
  --max-lines <number>   Line threshold for LONG_FILE. Default: ${DEFAULT_MAX_LINES}.
  --limit <number>       Max candidates printed in text mode. Default: ${DEFAULT_LIMIT}.
  --fail-on-candidates   Exit 1 when any candidate is found.

This is a deterministic heuristic audit for triphos-fsd-refactor. It does not replace
human FSD judgment; every candidate should be classified as fix, defer, or pass.`);
}

function collectSourceFiles(root) {
  if (!existsSync(root)) return [];
  const stats = statSync(root);
  if (stats.isFile()) return shouldAnalyzeFile(root) ? [root] : [];
  if (!stats.isDirectory()) return [];

  const dirName = root.split(sep).at(-1);
  if (IGNORED_DIRS.has(dirName)) return [];

  return readdirSync(root).flatMap((entry) => collectSourceFiles(join(root, entry)));
}

function shouldAnalyzeFile(filePath) {
  if (!SOURCE_EXTENSIONS.has(extname(filePath))) return false;
  return ![
    '.d.ts',
    '.test.',
    '.spec.',
    '.stories.',
    '.story.',
    '.generated.',
  ].some((marker) => filePath.includes(marker));
}

function analyzeFile(filePath) {
  const source = readFileSync(filePath, 'utf8');
  const lineCount = source.split(/\r?\n/).length;
  const fileExtension = extname(filePath);
  const fileName = basename(filePath);
  const isUiFile = UI_EXTENSIONS.has(fileExtension);
  const isHookLike =
    fileName.startsWith('use-') ||
    /(?:export\s+)?(?:const|function)\s+use[A-Z][A-Za-z0-9]*\b/u.test(source);
  const isOrchestrationHook = ORCHESTRATION_HOOK_PATTERN.test(fileName);
  const componentDefinitions = countMatches(
    source,
    /(?:export\s+)?(?:const|function)\s+[A-Z][A-Za-z0-9]*\b/g,
  );
  const jsxConditionalCount = isUiFile
    ? countMatches(source, /\?\s*(?:\(|<|\n)/g) + countMatches(source, /&&\s*(?:\(|<|\n)/g)
    : 0;
  const hookCounts = {
    useEffect: countMatches(source, /\buseEffect\s*\(/g),
    useMemo: countMatches(source, /\buseMemo\s*\(/g),
    useMutation: countMatches(source, /\buseMutation\s*\(/g),
    useQuery: countMatches(source, /\buseQuery\s*\(/g),
    useRef: countMatches(source, /\buseRef\s*</g) + countMatches(source, /\buseRef\s*\(/g),
    useState: countMatches(source, /\buseState\s*</g) + countMatches(source, /\buseState\s*\(/g),
  };
  const sectionHints = isUiFile
    ? SECTION_PATTERNS.filter(([, pattern]) => pattern.test(source)).map(([name]) => name)
    : [];
  const hookResponsibilityHints = isHookLike
    ? HOOK_RESPONSIBILITY_PATTERNS.filter(([, pattern]) => pattern.test(source)).map(([name]) => name)
    : [];
  const returnObjectKeys = isHookLike ? countReturnObjectKeys(source) : 0;

  const reasons = [];
  if (isUiFile && lineCount > options.maxLines) {
    reasons.push(`LONG_FILE(${lineCount}>${options.maxLines})`);
  }
  if (sectionHints.length >= 3) reasons.push(`SECTION_HINTS(${sectionHints.length})`);
  if (jsxConditionalCount >= 3) reasons.push(`JSX_CONDITIONALS(${jsxConditionalCount})`);
  if (isUiFile && componentDefinitions >= 3) {
    reasons.push(`MULTIPLE_COMPONENTS(${componentDefinitions})`);
  }
  if (isOrchestrationHook) reasons.push('ORCHESTRATION_HOOK_NAME');
  if (returnObjectKeys >= 10) reasons.push(`RETURN_OBJECT_HEAVY(${returnObjectKeys})`);
  if (hookResponsibilityHints.length >= 3) {
    reasons.push(`HOOK_RESPONSIBILITY_HINTS(${hookResponsibilityHints.length})`);
  }
  if ((isHookLike || isUiFile) && hookCounts.useState + hookCounts.useRef >= 7) {
    reasons.push(`LOCAL_STATE_HEAVY(${hookCounts.useState + hookCounts.useRef})`);
  }
  if ((isHookLike || isUiFile) && hookCounts.useEffect >= 3) {
    reasons.push(`EFFECT_HEAVY(${hookCounts.useEffect})`);
  }
  if (isUiFile && hookCounts.useMutation + hookCounts.useQuery > 0 && lineCount > 120) {
    reasons.push(`SERVER_STATE_IN_UI(${hookCounts.useMutation + hookCounts.useQuery})`);
  }

  return {
    path: relative(process.cwd(), filePath),
    lines: lineCount,
    severity: getSeverity(reasons, lineCount),
    reasons,
    metrics: {
      componentDefinitions,
      hookResponsibilityHints,
      jsxConditionalCount,
      returnObjectKeys,
      sectionHints,
      ...hookCounts,
    },
  };
}

function countMatches(source, pattern) {
  return source.match(pattern)?.length ?? 0;
}

function countReturnObjectKeys(source) {
  const matches = [...source.matchAll(/return\s*\{([\s\S]*?)\n\s*\}/g)];
  if (matches.length === 0) return 0;

  return Math.max(
    ...matches.map((match) =>
      match[1]
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => /^[A-Za-z_$][\w$]*\s*(?::|,|$)/u.test(line))
        .length,
    ),
  );
}

function getSeverity(reasons, lineCount) {
  if (reasons.some((reason) => reason.startsWith('LONG_FILE')) && lineCount >= 350) return 'high';
  if (
    reasons.some((reason) => reason.startsWith('RETURN_OBJECT_HEAVY')) &&
    reasons.includes('ORCHESTRATION_HOOK_NAME')
  ) {
    return 'high';
  }
  if (reasons.some((reason) => reason.startsWith('LONG_FILE'))) return 'medium';
  if (reasons.some((reason) => reason.startsWith('HOOK_RESPONSIBILITY_HINTS'))) return 'medium';
  if (
    reasons.some((reason) => reason.startsWith('SECTION_HINTS')) &&
    reasons.some((reason) => reason.startsWith('JSX_CONDITIONALS'))
  ) {
    return 'medium';
  }
  return 'low';
}

function severityRank(severity) {
  if (severity === 'high') return 3;
  if (severity === 'medium') return 2;
  return 1;
}

function printTextReport(filesScanned, reports) {
  console.log('triphos-fsd UI component and hook audit');
  console.log(`files scanned: ${filesScanned}`);
  console.log(`candidates: ${reports.length}`);
  console.log(`line threshold: ${options.maxLines}`);

  const reasonCounts = new Map();
  for (const report of reports) {
    for (const reason of report.reasons) {
      const key = reason.replace(/\(.+\)$/, '');
      reasonCounts.set(key, (reasonCounts.get(key) ?? 0) + 1);
    }
  }

  if (reasonCounts.size > 0) {
    console.log(
      `reason summary: ${[...reasonCounts.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([reason, count]) => `${reason}=${count}`)
        .join(', ')}`,
    );
  }

  for (const report of reports.slice(0, options.limit)) {
    console.log('');
    console.log(`${report.severity.toUpperCase()} ${report.lines} ${report.path}`);
    console.log(`  reasons: ${report.reasons.join(', ')}`);
    console.log(
      `  metrics: components=${report.metrics.componentDefinitions}, conditionals=${report.metrics.jsxConditionalCount}, returnKeys=${report.metrics.returnObjectKeys}, useState=${report.metrics.useState}, useRef=${report.metrics.useRef}, useEffect=${report.metrics.useEffect}, useQuery=${report.metrics.useQuery}, useMutation=${report.metrics.useMutation}`,
    );
    console.log(`  section hints: ${report.metrics.sectionHints.join(', ') || '-'}`);
    console.log(`  hook hints: ${report.metrics.hookResponsibilityHints.join(', ') || '-'}`);
  }

  if (reports.length > options.limit) {
    console.log('');
    console.log(`truncated: ${reports.length - options.limit} more candidates not printed`);
  }
}

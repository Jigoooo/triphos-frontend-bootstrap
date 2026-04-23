#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { JSDOM } from 'jsdom';

export const DEFAULT_HOST = '127.0.0.1';
export const DEFAULT_PORT = 4173;
export const DESKTOP_VIEWPORT = { width: 1440, height: 1200 };
export const MOBILE_VIEWPORT = { width: 430, height: 932 };

function pnpmCommand() {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
}

export function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

export function ensureArtifactsDir(appRoot, scope) {
  const directory = resolve(appRoot, '.triphos', 'harness', scope);
  mkdirSync(directory, { recursive: true });
  return directory;
}

export function routeToStem(route) {
  const normalized = route
    .replace(/^\/+/, '')
    .replace(/[^a-z0-9]+/giu, '-')
    .replace(/^-+|-+$/gu, '');

  return normalized.length > 0 ? normalized : 'root';
}

function resolveOutputPath(appRoot, output) {
  return output ? resolve(appRoot, output) : null;
}

function readChromeFromPath(command) {
  const which = spawnSync('which', [command], {
    encoding: 'utf8',
    stdio: 'pipe',
  });

  return which.status === 0 ? which.stdout.trim() : null;
}

export function resolveChromeExecutable() {
  const explicit = process.env.TRIPHOS_CHROME_BIN;
  if (explicit) {
    return explicit;
  }

  const pathCandidate = [
    'google-chrome',
    'google-chrome-stable',
    'chromium',
    'chromium-browser',
    'chrome',
    'msedge',
    'microsoft-edge',
  ]
    .map((candidate) => readChromeFromPath(candidate))
    .find(Boolean);

  if (pathCandidate) {
    return pathCandidate;
  }

  const appCandidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];

  const appCandidate = appCandidates.find((candidate) => {
    const result = spawnSync('test', ['-x', candidate], { stdio: 'ignore' });
    return result.status === 0;
  });

  if (!appCandidate) {
    throw new Error(
      'Chrome or Chromium is required for Triphos harness verification. Set TRIPHOS_CHROME_BIN if it is installed in a non-standard location.',
    );
  }

  return appCandidate;
}

async function waitForServer(origin, serverProcess, logsRef) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Triphos harness dev server exited early.\n${logsRef.value}`);
    }

    if (logsRef.value.includes(origin)) {
      await delay(150);
      return;
    }

    try {
      const response = await fetch(origin);
      if (response.ok) {
        return;
      }
    } catch {
      // Wait for the server to become reachable.
    }

    await delay(250);
  }

  throw new Error(`Timed out while waiting for the Triphos harness dev server.\n${logsRef.value}`);
}

export async function startHarnessServer(
  appRoot,
  {
    host = DEFAULT_HOST,
    port = DEFAULT_PORT,
  } = {},
) {
  for (let offset = 0; offset < 10; offset += 1) {
    const candidatePort = port + offset;
    const logsRef = { value: '' };
    const serverProcess = spawn(
      pnpmCommand(),
      ['vite', 'dev', '--host', host, '--port', String(candidatePort), '--strictPort'],
      {
        cwd: appRoot,
        env: {
          ...process.env,
          BROWSER: 'none',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    const appendLog = (chunk) => {
      logsRef.value += chunk.toString();
    };

    serverProcess.stdout.on('data', appendLog);
    serverProcess.stderr.on('data', appendLog);

    const origin = `http://${host}:${candidatePort}`;

    try {
      await waitForServer(origin, serverProcess, logsRef);

      return {
        origin,
        logsRef,
        async stop() {
          if (serverProcess.exitCode !== null) {
            return;
          }

          serverProcess.kill('SIGTERM');
          await delay(200);

          if (serverProcess.exitCode === null) {
            serverProcess.kill('SIGKILL');
          }
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (serverProcess.exitCode === null) {
        serverProcess.kill('SIGTERM');
        await delay(200);
      }

      if (message.includes('Port ') && message.includes('is already in use')) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(`Triphos harness could not find a free dev-server port starting from ${port}.`);
}

export async function withHarnessServer(appRoot, runner, options = {}) {
  const server = await startHarnessServer(appRoot, options);

  try {
    return await runner(server);
  } finally {
    await server.stop();
  }
}

function runChrome(url, { viewport = DESKTOP_VIEWPORT, screenshotPath = null, dumpDom = false } = {}) {
  const chrome = resolveChromeExecutable();
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--allow-pre-commit-input',
    '--hide-scrollbars',
    `--window-size=${viewport.width},${viewport.height}`,
    '--virtual-time-budget=6000',
    '--run-all-compositor-stages-before-draw',
  ];

  if (dumpDom) {
    args.push('--dump-dom');
  }

  if (screenshotPath) {
    args.push(`--screenshot=${screenshotPath}`);
  }

  args.push(url);

  const result = spawnSync(chrome, args, {
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    throw new Error(
      `Chrome harness command failed for ${url}\n${result.stdout}\n${result.stderr}`.trim(),
    );
  }

  return result;
}

export function buildHarnessUrl(origin, route) {
  if (route.startsWith('http://') || route.startsWith('https://')) {
    return route;
  }

  return `${origin}${route.startsWith('/') ? route : `/${route}`}`;
}

export function dumpHarnessDom(origin, route, options = {}) {
  const url = buildHarnessUrl(origin, route);
  return runChrome(url, { ...options, dumpDom: true }).stdout;
}

export function captureHarnessScreenshot(origin, route, screenshotPath, options = {}) {
  const url = buildHarnessUrl(origin, route);
  runChrome(url, { ...options, screenshotPath });
  return screenshotPath;
}

export function parseHarnessHtml(html) {
  return {
    dom: new JSDOM(html),
  };
}

export async function readStableHarnessRoute(origin, route, predicate, attempts = 4) {
  let lastSnapshot = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const html = dumpHarnessDom(origin, route);
    const snapshot = parseHarnessHtml(html);
    lastSnapshot = snapshot;

    if (predicate(snapshot)) {
      return snapshot;
    }

    await delay(350);
  }

  return lastSnapshot;
}

export function assertTriphos(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function writeHarnessJson(outputPath, value) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(value, null, 2) + '\n');
}

export function defaultDomOutputPath(appRoot, route) {
  return resolve(ensureArtifactsDir(appRoot, 'dom'), `${routeToStem(route)}.html`);
}

export function defaultScreenshotOutputPath(appRoot, route, viewportName) {
  return resolve(ensureArtifactsDir(appRoot, 'screenshots'), `${routeToStem(route)}-${viewportName}.png`);
}

export function buildHarnessSummary(label, state) {
  return `${label}: ok`;
}

export function printHarnessArtifact(label, path) {
  console.log(`${label}: ${basename(path)}`);
}

export function resolveRequestedOutput(appRoot, output, fallbackPath) {
  return resolveOutputPath(appRoot, output) ?? fallbackPath;
}

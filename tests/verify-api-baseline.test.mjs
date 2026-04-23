import assert from "node:assert/strict";
import { cpSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const templateRoot = resolve(
  repoRoot,
  "plugins",
  "triphos-frontend-bootstrap",
  "templates",
  "app",
);

function makeFixture(prefix) {
  const tempRoot = mkdtempSync(resolve(tmpdir(), prefix));
  const fixtureRoot = resolve(tempRoot, "app");

  cpSync(templateRoot, fixtureRoot, {
    recursive: true,
    filter: (source) => {
      const normalized = source.replaceAll("\\", "/");
      return !normalized.includes("/node_modules/") && !normalized.endsWith("/node_modules");
    },
  });

  return { fixtureRoot, tempRoot };
}

function runVerifyApi(appRoot) {
  return spawnSync("node", [resolve(appRoot, "scripts", "verify-api-baseline.mjs")], {
    cwd: appRoot,
    encoding: "utf8",
    stdio: "pipe",
  });
}

function writeFixtureFile(appRoot, relativePath, content) {
  const absolutePath = resolve(appRoot, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content);
}

test("verify-api-baseline passes for the template app", () => {
  const result = runVerifyApi(templateRoot);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /API baseline verified/u);
});

test("verify-api-baseline rejects entity API files that bypass apiWithAdapter", () => {
  const { fixtureRoot, tempRoot } = makeFixture("tfb-verify-api-entity-");

  try {
    writeFixtureFile(
      fixtureRoot,
      "src/entities/member/api/member-api.ts",
      `import { api } from '@jigoooo/api-client';

import type { Me, UpdateMeRequest } from '../model/me-type';

const MEMBER_PATH = '/member/me';

export const memberApi = {
  getMe: () => api.get(MEMBER_PATH),
  updateMe: (data: UpdateMeRequest) => api.patch(MEMBER_PATH, data),
};
`,
    );

    const result = runVerifyApi(fixtureRoot);
    const output = `${result.stdout}\n${result.stderr}`;

    assert.notEqual(result.status, 0);
    assert.match(output, /member-api\.ts must import apiWithAdapter/u);
    assert.match(output, /member-api\.ts contains raw API client call without apiWithAdapter/u);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("verify-api-baseline rejects raw HTTP usage outside approved API surfaces", () => {
  const { fixtureRoot, tempRoot } = makeFixture("tfb-verify-api-raw-http-");

  try {
    writeFixtureFile(
      fixtureRoot,
      "src/features/debug/model/use-debug.ts",
      `export async function loadDebugData() {
  return fetch('/debug');
}
`,
    );

    const result = runVerifyApi(fixtureRoot);
    const output = `${result.stdout}\n${result.stderr}`;

    assert.notEqual(result.status, 0);
    assert.match(output, /use-debug\.ts contains forbidden raw HTTP usage/u);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

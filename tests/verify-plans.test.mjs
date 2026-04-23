import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
      return (
        !normalized.includes("/node_modules/") &&
        !normalized.endsWith("/node_modules") &&
        !normalized.includes("/dist/") &&
        !normalized.endsWith("/dist") &&
        !normalized.includes("/.triphos/") &&
        !normalized.endsWith("/.triphos") &&
        !normalized.endsWith("/.triphos-template-source")
      );
    },
  });

  return { fixtureRoot, tempRoot };
}

function runVerifyPlans(appRoot) {
  return spawnSync("node", [resolve(appRoot, "scripts", "verify-plans.mjs")], {
    cwd: appRoot,
    encoding: "utf8",
    stdio: "pipe",
  });
}

function initCommittedRepo(appRoot) {
  const commands = [
    ["git", "init"],
    ["git", "config", "user.name", "Triphos"],
    ["git", "config", "user.email", "triphos@example.com"],
    ["git", "add", "-A"],
    ["git", "commit", "-m", "init"],
  ];

  for (const command of commands) {
    const result = spawnSync(command[0], command.slice(1), {
      cwd: appRoot,
      encoding: "utf8",
      stdio: "pipe",
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  }
}

function writeFixtureFile(appRoot, relativePath, content) {
  const absolutePath = resolve(appRoot, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content);
}

test("verify-plans skips outside a git repository", () => {
  const { fixtureRoot, tempRoot } = makeFixture("tfb-verify-plans-skip-");

  try {
    const result = runVerifyPlans(fixtureRoot);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /skipped: no git repository/u);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("verify-plans skips for the plugin template source", () => {
  const result = runVerifyPlans(templateRoot);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /template source is exempt/u);
});

test("verify-plans fails for non-trivial changes without a current plan bundle", () => {
  const { fixtureRoot, tempRoot } = makeFixture("tfb-verify-plans-fail-");

  try {
    initCommittedRepo(fixtureRoot);
    writeFixtureFile(
      fixtureRoot,
      "src/app/router.tsx",
      readFileSync(resolve(fixtureRoot, "src/app/router.tsx"), "utf8") + "\n// changed for test\n",
    );

    const result = runVerifyPlans(fixtureRoot);
    const output = `${result.stdout}\n${result.stderr}`;

    assert.notEqual(result.status, 0);
    assert.match(output, /Non-trivial changes require a plan bundle/u);
    assert.match(output, /src\/app\/router\.tsx/u);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("verify-plans passes when the current change set updates a complete plan bundle", () => {
  const { fixtureRoot, tempRoot } = makeFixture("tfb-verify-plans-pass-");

  try {
    initCommittedRepo(fixtureRoot);
    writeFixtureFile(
      fixtureRoot,
      "src/app/router.tsx",
      readFileSync(resolve(fixtureRoot, "src/app/router.tsx"), "utf8") + "\n// changed for test\n",
    );

    const planDir = "docs/plans/active/2026-04-23-router-update";
    writeFixtureFile(fixtureRoot, `${planDir}/PLAN.md`, "# Plan\n");
    writeFixtureFile(fixtureRoot, `${planDir}/STATUS.md`, "# Status\n");
    writeFixtureFile(fixtureRoot, `${planDir}/DECISIONS.md`, "# Decisions\n");
    writeFixtureFile(fixtureRoot, `${planDir}/VERIFICATION.md`, "# Verification\n");

    const result = runVerifyPlans(fixtureRoot);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /Plan verification passed/u);
    assert.match(result.stdout, /2026-04-23-router-update/u);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("verify-plans fails for non-trivial monorepo package changes without a plan bundle", () => {
  const tempRoot = mkdtempSync(resolve(tmpdir(), "tfb-verify-plans-monorepo-fail-"));
  const fixtureRoot = resolve(tempRoot, "apps", "frontend");

  try {
    cpSync(templateRoot, fixtureRoot, {
      recursive: true,
      filter: (source) => {
        const normalized = source.replaceAll("\\", "/");
        return (
          !normalized.includes("/node_modules/") &&
          !normalized.endsWith("/node_modules") &&
          !normalized.includes("/dist/") &&
          !normalized.endsWith("/dist") &&
          !normalized.includes("/.triphos/") &&
          !normalized.endsWith("/.triphos") &&
          !normalized.endsWith("/.triphos-template-source")
        );
      },
    });

    initCommittedRepo(tempRoot);
    writeFixtureFile(
      fixtureRoot,
      "src/app/router.tsx",
      readFileSync(resolve(fixtureRoot, "src/app/router.tsx"), "utf8") + "\n// monorepo change\n",
    );

    const result = runVerifyPlans(fixtureRoot);
    const output = `${result.stdout}\n${result.stderr}`;

    assert.notEqual(result.status, 0);
    assert.match(output, /Non-trivial changes require a plan bundle/u);
    assert.match(output, /src\/app\/router\.tsx/u);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("verify-plans passes for a monorepo package when the current change set updates a complete plan bundle", () => {
  const tempRoot = mkdtempSync(resolve(tmpdir(), "tfb-verify-plans-monorepo-pass-"));
  const fixtureRoot = resolve(tempRoot, "apps", "frontend");

  try {
    cpSync(templateRoot, fixtureRoot, {
      recursive: true,
      filter: (source) => {
        const normalized = source.replaceAll("\\", "/");
        return (
          !normalized.includes("/node_modules/") &&
          !normalized.endsWith("/node_modules") &&
          !normalized.includes("/dist/") &&
          !normalized.endsWith("/dist") &&
          !normalized.includes("/.triphos/") &&
          !normalized.endsWith("/.triphos") &&
          !normalized.endsWith("/.triphos-template-source")
        );
      },
    });

    initCommittedRepo(tempRoot);
    writeFixtureFile(
      fixtureRoot,
      "src/app/router.tsx",
      readFileSync(resolve(fixtureRoot, "src/app/router.tsx"), "utf8") + "\n// monorepo change\n",
    );

    const planDir = "docs/plans/active/2026-04-23-monorepo-router-update";
    writeFixtureFile(fixtureRoot, `${planDir}/PLAN.md`, "# Plan\n");
    writeFixtureFile(fixtureRoot, `${planDir}/STATUS.md`, "# Status\n");
    writeFixtureFile(fixtureRoot, `${planDir}/DECISIONS.md`, "# Decisions\n");
    writeFixtureFile(fixtureRoot, `${planDir}/VERIFICATION.md`, "# Verification\n");

    const result = runVerifyPlans(fixtureRoot);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /Plan verification passed/u);
    assert.match(result.stdout, /2026-04-23-monorepo-router-update/u);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

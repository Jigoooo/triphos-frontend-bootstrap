import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
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
const finalizeScript = resolve(
  repoRoot,
  "plugins",
  "triphos-frontend-bootstrap",
  "scripts",
  "finalize-init.mjs",
);

function copyTemplate(target) {
  cpSync(templateRoot, target, {
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
}

function runFinalize(targetDir) {
  return spawnSync("node", [finalizeScript, "--target", targetDir], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "pipe",
  });
}

function initCommittedRepo(repoDir) {
  const commands = [
    ["git", "init"],
    ["git", "config", "user.name", "Triphos"],
    ["git", "config", "user.email", "triphos@example.com"],
    ["git", "add", "-A"],
    ["git", "commit", "-m", "init"],
  ];

  for (const command of commands) {
    const result = spawnSync(command[0], command.slice(1), {
      cwd: repoDir,
      encoding: "utf8",
      stdio: "pipe",
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  }
}

test("finalize-init initializes git and creates an initial commit for a standalone app", () => {
  const tempRoot = mkdtempSync(resolve(tmpdir(), "tfb-finalize-standalone-"));
  const fixtureRoot = resolve(tempRoot, "app");

  try {
    copyTemplate(fixtureRoot);

    const result = runFinalize(fixtureRoot);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(existsSync(resolve(fixtureRoot, ".git")), true);

    const lastCommit = spawnSync("git", ["log", "--oneline", "-1"], {
      cwd: fixtureRoot,
      encoding: "utf8",
      stdio: "pipe",
    });
    assert.equal(lastCommit.status, 0, lastCommit.stderr || lastCommit.stdout);
    assert.match(lastCommit.stdout, /chore: initialize Triphos frontend app/u);

    const status = spawnSync("git", ["status", "--short"], {
      cwd: fixtureRoot,
      encoding: "utf8",
      stdio: "pipe",
    });
    assert.equal(status.status, 0, status.stderr || status.stdout);
    assert.equal(status.stdout.trim(), "");
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("finalize-init skips git bootstrap inside a parent repository", () => {
  const tempRoot = mkdtempSync(resolve(tmpdir(), "tfb-finalize-monorepo-"));
  const fixtureRoot = resolve(tempRoot, "apps", "frontend");

  try {
    copyTemplate(fixtureRoot);
    initCommittedRepo(tempRoot);

    const beforeCount = spawnSync("git", ["rev-list", "--count", "HEAD"], {
      cwd: tempRoot,
      encoding: "utf8",
      stdio: "pipe",
    });
    assert.equal(beforeCount.status, 0, beforeCount.stderr || beforeCount.stdout);

    const result = runFinalize(fixtureRoot);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(existsSync(resolve(fixtureRoot, ".git")), false);
    assert.match(result.stdout, /skipped: parent repository detected/u);

    const afterCount = spawnSync("git", ["rev-list", "--count", "HEAD"], {
      cwd: tempRoot,
      encoding: "utf8",
      stdio: "pipe",
    });
    assert.equal(afterCount.status, 0, afterCount.stderr || afterCount.stdout);
    assert.equal(afterCount.stdout.trim(), beforeCount.stdout.trim());
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

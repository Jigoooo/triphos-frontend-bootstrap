import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const scriptPath = resolve(
  repoRoot,
  "plugins",
  "triphos-frontend-bootstrap",
  "scripts",
  "scaffold-app.mjs",
);

test("scaffold-app allows known runtime state directories in the target", () => {
  const target = mkdtempSync(resolve(tmpdir(), "tfb-scaffold-allow-"));

  try {
    const allowedEntries = [
      ".omx",
      ".omc",
      ".triphos",
      ".codex",
      ".claude",
      ".agents",
      ".cursor",
      ".vscode",
      ".idea",
      ".zed",
      ".git",
    ];

    for (const entry of allowedEntries) {
      mkdirSync(resolve(target, entry), { recursive: true });
    }

    const result = spawnSync("node", [scriptPath, "--target", target, "--name", "tfb-allow"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: "pipe",
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(existsSync(resolve(target, "package.json")), true);
    for (const entry of allowedEntries) {
      assert.equal(existsSync(resolve(target, entry)), true);
    }

    const packageJson = JSON.parse(readFileSync(resolve(target, "package.json"), "utf8"));
    assert.equal(packageJson.name, "tfb-allow");
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});

test("scaffold-app defaults to the current directory and derives the package name", () => {
  const tempRoot = mkdtempSync(resolve(tmpdir(), "tfb-scaffold-cwd-"));
  const target = resolve(tempRoot, "Team Console");

  try {
    mkdirSync(target, { recursive: true });

    const result = spawnSync("node", [scriptPath], {
      cwd: target,
      encoding: "utf8",
      stdio: "pipe",
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(existsSync(resolve(target, "package.json")), true);

    const packageJson = JSON.parse(readFileSync(resolve(target, "package.json"), "utf8"));
    assert.equal(packageJson.name, "team-console");
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("scaffold-app derives the default package name from an explicit target", () => {
  const tempRoot = mkdtempSync(resolve(tmpdir(), "tfb-scaffold-name-"));
  const target = resolve(tempRoot, "ops-dashboard");

  try {
    const result = spawnSync("node", [scriptPath, "--target", target], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: "pipe",
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);

    const packageJson = JSON.parse(readFileSync(resolve(target, "package.json"), "utf8"));
    assert.equal(packageJson.name, "ops-dashboard");
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("scaffold-app still rejects user-managed files in the target", () => {
  const target = mkdtempSync(resolve(tmpdir(), "tfb-scaffold-block-"));

  try {
    writeFileSync(resolve(target, "notes.txt"), "keep me\n");

    const result = spawnSync("node", [scriptPath, "--target", target, "--name", "tfb-block"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: "pipe",
    });

    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr || result.stdout,
      /Target directory contains blocking entries: notes\.txt/,
    );
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});

test("scaffold-app omits template runtime artifacts", () => {
  const target = mkdtempSync(resolve(tmpdir(), "tfb-scaffold-clean-"));

  try {
    const result = spawnSync("node", [scriptPath, "--target", target, "--name", "tfb-clean"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: "pipe",
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(existsSync(resolve(target, "node_modules")), false);
    assert.equal(existsSync(resolve(target, "dist")), false);
    assert.equal(existsSync(resolve(target, ".triphos")), false);
    assert.equal(existsSync(resolve(target, ".triphos-template-source")), false);
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});

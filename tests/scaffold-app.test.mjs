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

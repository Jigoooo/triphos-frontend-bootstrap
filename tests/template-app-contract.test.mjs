import assert from "node:assert/strict";
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
const checkScript = resolve(
  repoRoot,
  "plugins",
  "triphos-frontend-bootstrap",
  "scripts",
  "check-app-constraints.mjs",
);

test("template app satisfies the enforced scaffold contract", () => {
  const result = spawnSync("node", [checkScript, "--target", templateRoot], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "pipe",
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /App constraints passed/u);
});

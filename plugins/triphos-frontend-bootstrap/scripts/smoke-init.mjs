#!/usr/bin/env node

import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const fixtureRoot = mkdtempSync(resolve(tmpdir(), "triphos-fixture-"));
const appDir = resolve(fixtureRoot, "typescript-pnpm");
const scriptDir = new URL(".", import.meta.url).pathname;

const scaffold = spawnSync(
  "node",
  [
    resolve(scriptDir, "scaffold-app.mjs"),
    "--target",
    appDir,
    "--name",
    "triphos-fixture-app",
    "--install",
  ],
  { stdio: "inherit" },
);

if (scaffold.status !== 0) {
  process.exit(scaffold.status ?? 1);
}

const typecheck = spawnSync("pnpm", ["typecheck"], { cwd: appDir, stdio: "inherit" });
if (typecheck.status !== 0) {
  process.exit(typecheck.status ?? 1);
}

console.log(`Smoke init passed: ${appDir}`);


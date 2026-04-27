#!/usr/bin/env node

import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

const { template = "app" } = parseArgs(process.argv.slice(2));
const fixturePrefix = template === "app-ssr" ? "triphos-fixture-ssr-" : "triphos-fixture-";
const fixtureRoot = mkdtempSync(resolve(tmpdir(), fixturePrefix));
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
    "--template",
    template,
    "--install",
  ],
  { stdio: "inherit" },
);

if (scaffold.status !== 0) {
  process.exit(scaffold.status ?? 1);
}

const constraints = spawnSync(
  "node",
  [resolve(scriptDir, "check-app-constraints.mjs"), "--target", appDir, "--variant", template],
  { stdio: "inherit" },
);
if (constraints.status !== 0) {
  process.exit(constraints.status ?? 1);
}

const verifyFrontend = spawnSync("pnpm", ["verify:frontend"], { cwd: appDir, stdio: "inherit" });
if (verifyFrontend.status !== 0) {
  process.exit(verifyFrontend.status ?? 1);
}

const typecheck = spawnSync("pnpm", ["typecheck"], { cwd: appDir, stdio: "inherit" });
if (typecheck.status !== 0) {
  process.exit(typecheck.status ?? 1);
}

const build = spawnSync("pnpm", ["build"], { cwd: appDir, stdio: "inherit" });
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const finalizeGit = spawnSync(
  "node",
  [resolve(scriptDir, "finalize-init.mjs"), "--target", appDir],
  { stdio: "inherit" },
);
if (finalizeGit.status !== 0) {
  process.exit(finalizeGit.status ?? 1);
}

const gitLog = spawnSync("git", ["log", "--oneline", "-1"], {
  cwd: appDir,
  encoding: "utf8",
  stdio: "pipe",
});
if (gitLog.status !== 0 || !gitLog.stdout.includes("chore: initialize Triphos frontend app")) {
  console.error(gitLog.stderr || gitLog.stdout || "Missing initial commit after finalize-init.");
  process.exit(gitLog.status ?? 1);
}

const gitStatus = spawnSync("git", ["status", "--short"], {
  cwd: appDir,
  encoding: "utf8",
  stdio: "pipe",
});
if (gitStatus.status !== 0 || gitStatus.stdout.trim().length > 0) {
  console.error(gitStatus.stderr || gitStatus.stdout || "Git worktree is not clean after finalize-init.");
  process.exit(gitStatus.status ?? 1);
}

console.log(`Smoke init passed (${template}): ${appDir}`);

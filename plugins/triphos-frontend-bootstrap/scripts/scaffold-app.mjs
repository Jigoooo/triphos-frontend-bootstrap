#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(scriptDir, "..");
const templateRoot = resolve(pluginRoot, "templates", "app");
const IGNORED_TARGET_ENTRIES = new Set([
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
  ".DS_Store",
  "Thumbs.db",
]);

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) {
        args[key] = true;
      } else {
        args[key] = next;
        index += 1;
      }
    }
  }
  return args;
}

function ensurePnpm() {
  const pnpm = spawnSync("pnpm", ["--version"], { stdio: "pipe" });
  if (pnpm.status === 0) {
    return;
  }

  const enabled = spawnSync("corepack", ["enable"], { stdio: "inherit" });
  if (enabled.status !== 0) {
    throw new Error("pnpm is missing and corepack enable failed");
  }

  const prepared = spawnSync("corepack", ["prepare", "pnpm@10.8.1", "--activate"], {
    stdio: "inherit",
  });
  if (prepared.status !== 0) {
    throw new Error("pnpm activation failed. Install pnpm manually and retry.");
  }
}

function ensureScaffoldReadyDirectory(targetDir) {
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
    return;
  }

  const entries = readdirSync(targetDir);
  const blockingEntries = entries.filter((entry) => !IGNORED_TARGET_ENTRIES.has(entry));
  if (blockingEntries.length > 0) {
    throw new Error(
      `Target directory contains blocking entries: ${blockingEntries.join(", ")}. ` +
        `Only runtime state entries may remain: ${Array.from(IGNORED_TARGET_ENTRIES).join(", ")}.`,
    );
  }
}

function replacePackageName(targetDir, packageName) {
  const packageJsonPath = resolve(targetDir, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  packageJson.name = packageName;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
}

const args = parseArgs(process.argv.slice(2));
const target = args.target ? resolve(process.cwd(), args.target) : null;
const name = args.name || "triphos-frontend-app";
const install = Boolean(args.install);

if (!target) {
  console.error("Usage: node scaffold-app.mjs --target <dir> [--name <package-name>] [--install]");
  process.exit(1);
}

ensurePnpm();
ensureScaffoldReadyDirectory(target);
cpSync(templateRoot, target, { recursive: true });
replacePackageName(target, name);

if (install) {
  const installResult = spawnSync("pnpm", ["install"], {
    cwd: target,
    stdio: "inherit",
  });
  if (installResult.status !== 0) {
    process.exit(installResult.status ?? 1);
  }
}

console.log(`Scaffolded Triphos app at ${target}`);

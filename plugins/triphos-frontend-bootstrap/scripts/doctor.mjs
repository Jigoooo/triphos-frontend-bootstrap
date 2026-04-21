#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(scriptDir, "..");
const repoRoot = resolve(pluginRoot, "..", "..");

const checks = [];

function pushCheck(label, ok, detail) {
  checks.push({ label, ok, detail });
}

function hasCommand(command, args = ["--version"]) {
  const result = spawnSync(command, args, { stdio: "pipe", encoding: "utf8" });
  return result.status === 0;
}

pushCheck(
  "claude marketplace manifest",
  existsSync(resolve(repoRoot, ".claude-plugin", "marketplace.json")),
  resolve(repoRoot, ".claude-plugin", "marketplace.json"),
);
pushCheck(
  "codex marketplace manifest",
  existsSync(resolve(repoRoot, ".agents", "plugins", "marketplace.json")),
  resolve(repoRoot, ".agents", "plugins", "marketplace.json"),
);
pushCheck(
  "plugin manifests",
  existsSync(resolve(pluginRoot, ".claude-plugin", "plugin.json")) &&
    existsSync(resolve(pluginRoot, ".codex-plugin", "plugin.json")),
  resolve(pluginRoot),
);
pushCheck(
  "template package",
  existsSync(resolve(pluginRoot, "templates", "app", "package.json")),
  resolve(pluginRoot, "templates", "app", "package.json"),
);

const pnpmReady = hasCommand("pnpm");
const corepackReady = hasCommand("corepack");
pushCheck("pnpm available", pnpmReady, pnpmReady ? "pnpm found" : "pnpm missing");
pushCheck(
  "corepack fallback",
  pnpmReady || corepackReady,
  pnpmReady ? "pnpm already present" : corepackReady ? "corepack can activate pnpm" : "corepack missing",
);

const structure = spawnSync("node", [resolve(scriptDir, "validate-plugin-structure.mjs")], {
  stdio: "pipe",
  encoding: "utf8",
});
pushCheck("plugin structure", structure.status === 0, structure.stdout.trim() || structure.stderr.trim());

const constraints = spawnSync(
  "node",
  [resolve(scriptDir, "check-app-constraints.mjs"), "--target", resolve(pluginRoot, "templates", "app")],
  {
    stdio: "pipe",
    encoding: "utf8",
  },
);
pushCheck(
  "template constraints",
  constraints.status === 0,
  constraints.stdout.trim() || constraints.stderr.trim(),
);

for (const check of checks) {
  const status = check.ok ? "OK" : "FAIL";
  console.log(`[${status}] ${check.label}: ${check.detail}`);
}

if (checks.some((check) => !check.ok)) {
  process.exit(1);
}

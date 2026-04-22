#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  hasCodexHooksEnabled,
  readTextIfExists,
  resolveRuntimeConfigPaths,
} from "./runtime-config.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(scriptDir, "..");
const repoRoot = resolve(pluginRoot, "..", "..");

const checks = [];
const warnings = [];

function pushCheck(label, ok, detail) {
  checks.push({ label, ok, detail });
}

function pushWarning(label, detail) {
  warnings.push({ label, detail });
}

function toActivationLabel(ok) {
  return ok ? "effective" : "ineffective";
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

const repoRuntimePaths = resolveRuntimeConfigPaths(repoRoot);
const templateRuntimePaths = resolveRuntimeConfigPaths(resolve(pluginRoot, "templates", "app"));

const repoCodexConfig = readTextIfExists(repoRuntimePaths.codexConfigPath);
const templateCodexConfig = readTextIfExists(templateRuntimePaths.codexConfigPath);

pushCheck(
  "repo codex runtime activation",
  existsSync(repoRuntimePaths.codexHooksPath) && hasCodexHooksEnabled(repoCodexConfig),
  existsSync(repoRuntimePaths.codexHooksPath)
    ? hasCodexHooksEnabled(repoCodexConfig)
      ? `${toActivationLabel(true)}: repo .codex/hooks.json + codex_hooks=true`
      : `${toActivationLabel(false)}: repo .codex/config.toml missing codex_hooks = true`
    : `${toActivationLabel(false)}: repo .codex/hooks.json missing`,
);
pushCheck(
  "template codex runtime activation",
  existsSync(templateRuntimePaths.codexHooksPath) && hasCodexHooksEnabled(templateCodexConfig),
  existsSync(templateRuntimePaths.codexHooksPath)
    ? hasCodexHooksEnabled(templateCodexConfig)
      ? `${toActivationLabel(true)}: template .codex/hooks.json + codex_hooks=true`
      : `${toActivationLabel(false)}: template .codex/config.toml missing codex_hooks = true`
    : `${toActivationLabel(false)}: template .codex/hooks.json missing`,
);
pushCheck(
  "repo claude runtime activation",
  existsSync(repoRuntimePaths.claudeSettingsPath),
  existsSync(repoRuntimePaths.claudeSettingsPath)
    ? `${toActivationLabel(true)}: ${repoRuntimePaths.claudeSettingsPath}`
    : `${toActivationLabel(false)}: ${repoRuntimePaths.claudeSettingsPath}`,
);
pushCheck(
  "template claude runtime activation",
  existsSync(templateRuntimePaths.claudeSettingsPath),
  existsSync(templateRuntimePaths.claudeSettingsPath)
    ? `${toActivationLabel(true)}: ${templateRuntimePaths.claudeSettingsPath}`
    : `${toActivationLabel(false)}: ${templateRuntimePaths.claudeSettingsPath}`,
);

if (existsSync(repoRuntimePaths.claudeLocalSettingsPath)) {
  pushWarning(
    "repo claude local override",
    `${repoRuntimePaths.claudeLocalSettingsPath} exists and overrides shared project settings`,
  );
}

if (existsSync(templateRuntimePaths.claudeLocalSettingsPath)) {
  pushWarning(
    "template claude local override",
    `${templateRuntimePaths.claudeLocalSettingsPath} exists and overrides shared project settings`,
  );
}

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

for (const warning of warnings) {
  console.log(`[WARN] ${warning.label}: ${warning.detail}`);
}

if (checks.some((check) => !check.ok)) {
  process.exit(1);
}

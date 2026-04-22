#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = process.cwd();
const repoPackageJsonPath = resolve(repoRoot, "package.json");
const claudeMarketplacePath = resolve(repoRoot, ".claude-plugin", "marketplace.json");
const claudePluginPath = resolve(
  repoRoot,
  "plugins",
  "triphos-frontend-bootstrap",
  ".claude-plugin",
  "plugin.json",
);
const codexPluginPath = resolve(
  repoRoot,
  "plugins",
  "triphos-frontend-bootstrap",
  ".codex-plugin",
  "plugin.json",
);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
}

function updateIfChanged(path, updater) {
  const before = readJson(path);
  const after = updater(structuredClone(before));
  const beforeSerialized = JSON.stringify(before);
  const afterSerialized = JSON.stringify(after);

  if (beforeSerialized === afterSerialized) {
    return false;
  }

  writeJson(path, after);
  return true;
}

const repoPackageJson = readJson(repoPackageJsonPath);
const nextVersion = repoPackageJson.version;
let changed = false;

changed =
  updateIfChanged(claudePluginPath, (payload) => {
    payload.version = nextVersion;
    return payload;
  }) || changed;

changed =
  updateIfChanged(codexPluginPath, (payload) => {
    payload.version = nextVersion;
    return payload;
  }) || changed;

changed =
  updateIfChanged(claudeMarketplacePath, (payload) => {
    payload.version = nextVersion;

    if (Array.isArray(payload.plugins)) {
      payload.plugins = payload.plugins.map((plugin) =>
        plugin?.name === "triphos-frontend-bootstrap"
          ? {
              ...plugin,
              version: nextVersion,
            }
          : plugin,
      );
    }

    return payload;
  }) || changed;

if (changed) {
  console.log(`Synchronized plugin metadata versions to ${nextVersion}.`);
} else {
  console.log(`Plugin metadata already synchronized at ${nextVersion}.`);
}

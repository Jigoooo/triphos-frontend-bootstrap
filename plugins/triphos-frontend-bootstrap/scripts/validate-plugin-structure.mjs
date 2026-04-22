#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(scriptDir, "..");
const repoRoot = resolve(pluginRoot, "..", "..");
const repoPackageJson = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8"));
const claudePluginJsonPath = resolve(pluginRoot, ".claude-plugin", "plugin.json");
const codexPluginJsonPath = resolve(pluginRoot, ".codex-plugin", "plugin.json");

const requiredPaths = [
  resolve(repoRoot, "bin", "triphos-frontend-bootstrap"),
  resolve(repoRoot, "scripts", "install-lib.mjs"),
  resolve(repoRoot, ".claude-plugin", "marketplace.json"),
  resolve(repoRoot, ".agents", "plugins", "marketplace.json"),
  resolve(pluginRoot, ".claude-plugin", "plugin.json"),
  resolve(pluginRoot, ".codex-plugin", "plugin.json"),
  resolve(pluginRoot, "scripts", "register-claude-local.mjs"),
  resolve(pluginRoot, "scripts", "register-codex-local.mjs"),
  resolve(pluginRoot, "skills", "codex", "triphos-frontend-init", "SKILL.md"),
  resolve(pluginRoot, "skills", "codex", "triphos-theme-setup", "SKILL.md"),
  resolve(pluginRoot, "skills", "claude", "triphos-frontend-init", "SKILL.md"),
  resolve(pluginRoot, "skills", "claude", "triphos-theme-setup", "SKILL.md"),
  resolve(pluginRoot, "references", "internal", "frontend-bootstrap-router.md"),
  resolve(pluginRoot, "references", "internal", "frontend-doctor.md"),
  resolve(pluginRoot, "templates", "app", "package.json"),
  resolve(pluginRoot, "templates", "app", "AGENTS.md"),
  resolve(pluginRoot, "templates", "app", "AGENTS.en.md"),
  resolve(pluginRoot, "templates", "app", "CLAUDE.md"),
  resolve(pluginRoot, "templates", "app", "CLAUDE.en.md"),
  resolve(pluginRoot, "templates", "app", "vite.config.ts"),
  resolve(pluginRoot, "templates", "app", "src", "shared", "theme", "index.ts"),
  resolve(pluginRoot, "templates", "app", "src", "shared", "constants", "index.ts"),
  resolve(pluginRoot, "templates", "app", "src", "shared", "types", "index.ts"),
  resolve(pluginRoot, "templates", "app", "src", "shared", "hooks", "index.ts"),
  resolve(pluginRoot, "templates", "app", "src", "shared", "ui", "button", "index.ts"),
  resolve(pluginRoot, "templates", "app", "src", "shared", "ui", "overlay-stack", "index.ts"),
  resolve(pluginRoot, "templates", "app", "src", "pages", "starter", "ui", "starter-page.tsx"),
  resolve(pluginRoot, "references", "shared", "latest-stack.md"),
  resolve(repoRoot, "README.ko.md"),
  resolve(repoRoot, "AGENTS.md"),
  resolve(repoRoot, "CLAUDE.md"),
];

const missing = requiredPaths.filter((path) => !existsSync(path));

if (missing.length > 0) {
  console.error("Triphos plugin structure check failed.");
  for (const path of missing) {
    console.error(`- missing: ${path}`);
  }
  process.exit(1);
}

const claudePluginJson = JSON.parse(readFileSync(claudePluginJsonPath, "utf8"));
const codexPluginJson = JSON.parse(readFileSync(codexPluginJsonPath, "utf8"));

if (claudePluginJson.version !== repoPackageJson.version) {
  console.error("Triphos plugin structure check failed.");
  console.error(
    `- claude plugin version mismatch: ${claudePluginJson.version} !== ${repoPackageJson.version}`,
  );
  process.exit(1);
}

if (codexPluginJson.version !== repoPackageJson.version) {
  console.error("Triphos plugin structure check failed.");
  console.error(
    `- codex plugin version mismatch: ${codexPluginJson.version} !== ${repoPackageJson.version}`,
  );
  process.exit(1);
}

console.log("Triphos plugin structure looks valid.");

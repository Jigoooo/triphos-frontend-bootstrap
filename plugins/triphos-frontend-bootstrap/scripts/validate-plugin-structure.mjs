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
const claudeMarketplaceJsonPath = resolve(repoRoot, ".claude-plugin", "marketplace.json");

const requiredPaths = [
  resolve(repoRoot, "bin", "triphos-frontend-bootstrap"),
  resolve(repoRoot, ".codex", "hooks.json"),
  resolve(repoRoot, ".codex", "config.toml"),
  resolve(repoRoot, ".claude", "settings.json"),
  resolve(repoRoot, "scripts", "install-lib.mjs"),
  resolve(repoRoot, "scripts", "hooks", "repo-codex-session-start.mjs"),
  resolve(repoRoot, "scripts", "hooks", "repo-codex-stop-verify.mjs"),
  resolve(repoRoot, "scripts", "hooks", "repo-claude-session-start.mjs"),
  resolve(repoRoot, "scripts", "hooks", "repo-claude-stop-verify.mjs"),
  resolve(repoRoot, "scripts", "hooks", "stop-verify-lib.mjs"),
  resolve(repoRoot, ".claude-plugin", "marketplace.json"),
  resolve(repoRoot, ".agents", "plugins", "marketplace.json"),
  resolve(pluginRoot, ".claude-plugin", "plugin.json"),
  resolve(pluginRoot, ".codex-plugin", "plugin.json"),
  resolve(pluginRoot, "scripts", "register-claude-local.mjs"),
  resolve(pluginRoot, "scripts", "register-codex-local.mjs"),
  resolve(pluginRoot, "scripts", "finalize-init.mjs"),
  resolve(pluginRoot, "scripts", "git-bootstrap-lib.mjs"),
  resolve(pluginRoot, "skills", "codex", "triphos-frontend-adopt", "SKILL.md"),
  resolve(pluginRoot, "skills", "codex", "triphos-frontend-init", "SKILL.md"),
  resolve(pluginRoot, "skills", "codex", "triphos-theme-setup", "SKILL.md"),
  resolve(pluginRoot, "skills", "claude", "triphos-frontend-adopt", "SKILL.md"),
  resolve(pluginRoot, "skills", "claude", "triphos-frontend-init", "SKILL.md"),
  resolve(pluginRoot, "skills", "claude", "triphos-theme-setup", "SKILL.md"),
  resolve(pluginRoot, "references", "internal", "frontend-bootstrap-router.md"),
  resolve(pluginRoot, "references", "internal", "frontend-doctor.md"),
  resolve(pluginRoot, "references", "shared", "frontend-policy.md"),
  resolve(pluginRoot, "references", "shared", "runtime-compat.md"),
  resolve(pluginRoot, "templates", "app", "package.json"),
  resolve(pluginRoot, "templates", "app", ".triphos-template-source"),
  resolve(pluginRoot, "templates", "app", ".codex", "hooks.json"),
  resolve(pluginRoot, "templates", "app", ".codex", "config.toml"),
  resolve(pluginRoot, "templates", "app", ".claude", "settings.json"),
  resolve(pluginRoot, "templates", "app", "docs", "README.md"),
  resolve(pluginRoot, "templates", "app", "docs", "architecture", "README.md"),
  resolve(pluginRoot, "templates", "app", "docs", "product", "README.md"),
  resolve(pluginRoot, "templates", "app", "docs", "plans", "README.md"),
  resolve(pluginRoot, "templates", "app", "docs", "decisions", "README.md"),
  resolve(pluginRoot, "templates", "app", "docs", "quality", "verification-matrix.md"),
  resolve(pluginRoot, "templates", "app", "docs", "quality", "visual-baseline", "README.md"),
  resolve(pluginRoot, "templates", "app", "docs", "quality", "visual-baseline", "starter-desktop.png"),
  resolve(pluginRoot, "templates", "app", "docs", "quality", "visual-baseline", "starter-mobile.png"),
  resolve(pluginRoot, "templates", "app", "AGENTS.md"),
  resolve(pluginRoot, "templates", "app", "AGENTS.en.md"),
  resolve(pluginRoot, "templates", "app", "CLAUDE.md"),
  resolve(pluginRoot, "templates", "app", "CLAUDE.en.md"),
  resolve(pluginRoot, "templates", "app", "vite.config.ts"),
  resolve(pluginRoot, "templates", "app", "scripts", "dev-harness.mjs"),
  resolve(pluginRoot, "templates", "app", "scripts", "capture-dom.mjs"),
  resolve(pluginRoot, "templates", "app", "scripts", "capture-screenshot.mjs"),
  resolve(pluginRoot, "templates", "app", "scripts", "verify-fsd.mjs"),
  resolve(pluginRoot, "templates", "app", "scripts", "verify-react-rules.mjs"),
  resolve(pluginRoot, "templates", "app", "scripts", "verify-api-baseline.mjs"),
  resolve(pluginRoot, "templates", "app", "scripts", "verify-plans.mjs"),
  resolve(pluginRoot, "templates", "app", "scripts", "verify-e2e.mjs"),
  resolve(pluginRoot, "templates", "app", "scripts", "verify-visual.mjs"),
  resolve(pluginRoot, "templates", "app", "scripts", "verify-uat.mjs"),
  resolve(pluginRoot, "templates", "app", "scripts", "harness", "harness-lib.mjs"),
  resolve(pluginRoot, "templates", "app", "scripts", "hooks", "stop-verify-lib.mjs"),
  resolve(pluginRoot, "templates", "app", "src", "shared", "theme", "index.ts"),
  resolve(pluginRoot, "templates", "app", "src", "shared", "api", "index.ts"),
  resolve(pluginRoot, "templates", "app", "src", "shared", "constants", "index.ts"),
  resolve(pluginRoot, "templates", "app", "src", "shared", "types", "index.ts"),
  resolve(pluginRoot, "templates", "app", "src", "shared", "hooks", "index.ts"),
  resolve(pluginRoot, "templates", "app", "src", "entities", "auth", "index.ts"),
  resolve(pluginRoot, "templates", "app", "src", "entities", "member", "index.ts"),
  resolve(pluginRoot, "templates", "app", "src", "entities", "auth", "model", "query-keys.ts"),
  resolve(pluginRoot, "templates", "app", "src", "entities", "auth", "model", "query-options.ts"),
  resolve(pluginRoot, "templates", "app", "src", "entities", "auth", "model", "mutation-options.ts"),
  resolve(pluginRoot, "templates", "app", "src", "entities", "member", "model", "query-keys.ts"),
  resolve(pluginRoot, "templates", "app", "src", "entities", "member", "model", "query-options.ts"),
  resolve(pluginRoot, "templates", "app", "src", "entities", "member", "model", "mutation-options.ts"),
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
const claudeMarketplaceJson = JSON.parse(readFileSync(claudeMarketplaceJsonPath, "utf8"));

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

if (claudeMarketplaceJson.version !== repoPackageJson.version) {
  console.error("Triphos plugin structure check failed.");
  console.error(
    `- claude marketplace version mismatch: ${claudeMarketplaceJson.version} !== ${repoPackageJson.version}`,
  );
  process.exit(1);
}

const marketplacePluginEntry = Array.isArray(claudeMarketplaceJson.plugins)
  ? claudeMarketplaceJson.plugins.find((item) => item?.name === claudePluginJson.name)
  : null;

if (!marketplacePluginEntry) {
  console.error("Triphos plugin structure check failed.");
  console.error(`- claude marketplace is missing plugin entry for ${claudePluginJson.name}`);
  process.exit(1);
}

if (marketplacePluginEntry.version !== repoPackageJson.version) {
  console.error("Triphos plugin structure check failed.");
  console.error(
    `- claude marketplace plugin version mismatch: ${marketplacePluginEntry.version} !== ${repoPackageJson.version}`,
  );
  process.exit(1);
}

console.log("Triphos plugin structure looks valid.");

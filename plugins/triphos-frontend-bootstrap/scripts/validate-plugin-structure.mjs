#!/usr/bin/env node

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(scriptDir, "..");
const repoRoot = resolve(pluginRoot, "..", "..");

const requiredPaths = [
  resolve(repoRoot, ".claude-plugin", "marketplace.json"),
  resolve(repoRoot, ".agents", "plugins", "marketplace.json"),
  resolve(pluginRoot, ".claude-plugin", "plugin.json"),
  resolve(pluginRoot, ".codex-plugin", "plugin.json"),
  resolve(pluginRoot, "skills", "codex", "triphos-frontend-bootstrap", "SKILL.md"),
  resolve(pluginRoot, "skills", "codex", "triphos-frontend-init", "SKILL.md"),
  resolve(pluginRoot, "skills", "codex", "triphos-frontend-doctor", "SKILL.md"),
  resolve(pluginRoot, "skills", "codex", "triphos-theme-setup", "SKILL.md"),
  resolve(pluginRoot, "skills", "claude", "triphos-frontend-bootstrap", "SKILL.md"),
  resolve(pluginRoot, "skills", "claude", "triphos-frontend-init", "SKILL.md"),
  resolve(pluginRoot, "skills", "claude", "triphos-frontend-doctor", "SKILL.md"),
  resolve(pluginRoot, "skills", "claude", "triphos-theme-setup", "SKILL.md"),
  resolve(pluginRoot, "templates", "app", "package.json"),
  resolve(pluginRoot, "templates", "app", "vite.config.ts"),
  resolve(pluginRoot, "templates", "app", "src", "shared", "theme", "index.ts"),
];

const missing = requiredPaths.filter((path) => !existsSync(path));

if (missing.length > 0) {
  console.error("Triphos plugin structure check failed.");
  for (const path of missing) {
    console.error(`- missing: ${path}`);
  }
  process.exit(1);
}

console.log("Triphos plugin structure looks valid.");

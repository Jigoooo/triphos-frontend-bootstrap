#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(scriptDir, "..");
const homeMarketplace = resolve(os.homedir(), ".agents", "plugins", "marketplace.json");
const repoPluginPath = pluginRoot;

let payload = {
  name: "local-plugins",
  interface: {
    displayName: "Local Plugins",
  },
  plugins: [],
};

if (existsSync(homeMarketplace)) {
  payload = JSON.parse(readFileSync(homeMarketplace, "utf8"));
}

payload.plugins = Array.isArray(payload.plugins) ? payload.plugins : [];

const entry = {
  name: "triphos-frontend-bootstrap",
  source: {
    source: "local",
    path: repoPluginPath,
  },
  policy: {
    installation: "AVAILABLE",
    authentication: "ON_INSTALL",
  },
  category: "Coding",
};

const existingIndex = payload.plugins.findIndex((item) => item?.name === entry.name);
if (existingIndex >= 0) {
  payload.plugins[existingIndex] = entry;
} else {
  payload.plugins.push(entry);
}

mkdirSync(dirname(homeMarketplace), { recursive: true });
writeFileSync(homeMarketplace, JSON.stringify(payload, null, 2) + "\n");

console.log(`Updated Codex marketplace: ${homeMarketplace}`);
console.log(`Registered plugin path: ${repoPluginPath}`);


#!/usr/bin/env node

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { installClaudePlugin, parseArgs } from "../../../scripts/install-lib.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(scriptDir, "..");
const repoRoot = resolve(pluginRoot, "..", "..");
const args = parseArgs(process.argv.slice(2));
const scope = args.scope === "local" ? "local" : "global";
const result = installClaudePlugin({
  scope,
  cwd: repoRoot,
});

console.log(`Installed Claude plugin (${scope}): ${result.marketplace}`);

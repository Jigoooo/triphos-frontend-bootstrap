#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function readTextIfExists(path) {
  if (!existsSync(path)) return null;
  return readFileSync(path, 'utf8');
}

export function hasCodexHooksEnabled(configContent) {
  if (!configContent) return false;
  return /\[features\][\s\S]*codex_hooks\s*=\s*true/u.test(configContent);
}

export function resolveRuntimeConfigPaths(baseDir) {
  return {
    codexConfigPath: resolve(baseDir, '.codex', 'config.toml'),
    codexHooksPath: resolve(baseDir, '.codex', 'hooks.json'),
    claudeSettingsPath: resolve(baseDir, '.claude', 'settings.json'),
    claudeLocalSettingsPath: resolve(baseDir, '.claude', 'settings.local.json'),
  };
}

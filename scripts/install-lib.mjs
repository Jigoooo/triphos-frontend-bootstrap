#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import { dirname, resolve } from "node:path";

export const PLUGIN_NAME = "triphos-frontend-bootstrap";
export const PACKAGE_NAME = "@jigoooo/triphos-frontend-bootstrap";
export const GITHUB_REPOSITORY = "Jigoooo/triphos-frontend-bootstrap";
const MANAGED_BLOCK_START = "# >>> triphos-frontend-bootstrap >>>";
const MANAGED_BLOCK_END = "# <<< triphos-frontend-bootstrap <<<";
const PUBLIC_CODEX_SKILLS = [
  "triphos-frontend-init",
  "triphos-frontend-adopt",
  "triphos-fsd-refactor",
  "triphos-react-lint-rules",
  "triphos-api-client-setup",
  "triphos-fsd-skill-update",
  "triphos-theme-setup",
];
const HIDDEN_CODEX_SKILLS = [
  "triphos-frontend-bootstrap",
  "triphos-frontend-doctor",
];
const MANAGED_CODEX_SKILLS = Array.from(
  new Set([...PUBLIC_CODEX_SKILLS, ...HIDDEN_CODEX_SKILLS]),
);
const CODEX_SKILL_MARKER_FILE = `.managed-${PLUGIN_NAME}-skills.json`;

export function isEphemeralExecution(env = process.env) {
  return env.npm_command === "exec" && env.npm_package_name === PACKAGE_NAME;
}

export function isNpmLauncherExecution(env = process.env) {
  return Boolean(
    env.npm_execpath ||
      env.npm_command === "exec" ||
      env.npm_lifecycle_event === "npx" ||
      env.npm_config_user_agent,
  );
}

export function getPackageVersion(packageRoot) {
  const packageJsonPath = resolve(packageRoot, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  return packageJson.version;
}

function normalizeCodexPayload(rawValue) {
  if (!rawValue) {
    return {
      name: "local-plugins",
      interface: {
        displayName: "Local Plugins",
      },
      plugins: [],
    };
  }

  const parsed = JSON.parse(rawValue);
  parsed.plugins = Array.isArray(parsed.plugins) ? parsed.plugins : [];
  parsed.interface = parsed.interface ?? { displayName: "Local Plugins" };
  parsed.name = parsed.name ?? "local-plugins";
  return parsed;
}

export function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const stripped = token.slice(2);
    const equalsIndex = stripped.indexOf("=");

    if (equalsIndex >= 0) {
      const key = stripped.slice(0, equalsIndex);
      args[key] = stripped.slice(equalsIndex + 1);
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[stripped] = true;
      continue;
    }

    args[stripped] = next;
    index += 1;
  }

  return args;
}

export function normalizeRuntime(rawValue) {
  if (!rawValue) {
    return null;
  }

  const value = String(rawValue).trim().toLowerCase();
  if (value === "claude" || value === "codex" || value === "both") {
    return value;
  }

  throw new Error(`Unsupported runtime: ${rawValue}`);
}

export function normalizeScope(rawValue) {
  if (!rawValue) {
    return null;
  }

  const value = String(rawValue).trim().toLowerCase();
  if (value === "global" || value === "local") {
    return value;
  }

  throw new Error(`Unsupported scope: ${rawValue}`);
}

export function normalizeDeleteScope(rawValue) {
  if (!rawValue) {
    return null;
  }

  const value = String(rawValue).trim().toLowerCase();
  if (value === "global" || value === "local" || value === "all") {
    return value;
  }

  throw new Error(`Unsupported delete scope: ${rawValue}`);
}

export function resolvePluginSourceRoot(packageRoot) {
  return resolve(packageRoot, "plugins", PLUGIN_NAME);
}

export function resolveCodexSkillsRoot({ scope, cwd = process.cwd() }) {
  if (scope === "global") {
    return resolve(os.homedir(), ".codex", "skills");
  }

  return resolve(cwd, ".codex", "skills");
}

export function resolveCodexInstallRoot({ scope, cwd = process.cwd() }) {
  if (scope === "global") {
    return resolve(os.homedir(), ".triphos", "plugins", PLUGIN_NAME);
  }

  return resolve(cwd, ".triphos", "plugins", PLUGIN_NAME);
}

export function resolveCodexMarketplacePath({ scope, cwd = process.cwd() }) {
  if (scope === "global") {
    return resolve(os.homedir(), ".agents", "plugins", "marketplace.json");
  }

  return resolve(cwd, ".agents", "plugins", "marketplace.json");
}

export function syncCodexPluginBundle({ sourceRoot, installRoot }) {
  rmSync(installRoot, { recursive: true, force: true });
  mkdirSync(dirname(installRoot), { recursive: true });
  cpSync(sourceRoot, installRoot, { recursive: true });
}

export function upsertCodexMarketplaceEntry({ marketplacePath, pluginPath }) {
  const payload = normalizeCodexPayload(
    existsSync(marketplacePath) ? readFileSync(marketplacePath, "utf8") : null,
  );

  const entry = {
    name: PLUGIN_NAME,
    source: {
      source: "local",
      path: pluginPath,
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

  mkdirSync(dirname(marketplacePath), { recursive: true });
  writeFileSync(marketplacePath, JSON.stringify(payload, null, 2) + "\n");
}

export function removeCodexMarketplaceEntry({ marketplacePath }) {
  if (!existsSync(marketplacePath)) {
    return {
      changed: false,
      marketplacePath,
    };
  }

  const payload = normalizeCodexPayload(readFileSync(marketplacePath, "utf8"));
  const nextPlugins = payload.plugins.filter((item) => item?.name !== PLUGIN_NAME);
  const changed = nextPlugins.length !== payload.plugins.length;
  payload.plugins = nextPlugins;
  writeFileSync(marketplacePath, JSON.stringify(payload, null, 2) + "\n");

  return {
    changed,
    marketplacePath,
  };
}

export function installCodexPlugin({ packageRoot, scope, cwd = process.cwd() }) {
  const sourceRoot = resolvePluginSourceRoot(packageRoot);
  const installRoot = resolveCodexInstallRoot({ scope, cwd });
  const marketplacePath = resolveCodexMarketplacePath({ scope, cwd });
  const skillsRoot = resolveCodexSkillsRoot({ scope, cwd });

  syncCodexPluginBundle({ sourceRoot, installRoot });
  upsertCodexMarketplaceEntry({
    marketplacePath,
    pluginPath: installRoot,
  });
  syncCodexSkills({
    pluginInstallRoot: installRoot,
    skillsRoot,
  });

  return {
    installRoot,
    marketplacePath,
    skillsRoot,
  };
}

function readManagedCodexSkillNames(skillsRoot) {
  const markerPath = resolve(skillsRoot, CODEX_SKILL_MARKER_FILE);
  if (!existsSync(markerPath)) {
    return {
      markerPath,
      skillNames: MANAGED_CODEX_SKILLS,
    };
  }

  try {
    const parsed = JSON.parse(readFileSync(markerPath, "utf8"));
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return {
        markerPath,
        skillNames: parsed,
      };
    }
  } catch {
    // Fall back to the current managed skill set if the marker file is corrupt.
  }

  return {
    markerPath,
    skillNames: MANAGED_CODEX_SKILLS,
  };
}

function removeManagedCodexSkills(skillsRoot) {
  const { markerPath, skillNames } = readManagedCodexSkillNames(skillsRoot);

  for (const skillName of skillNames) {
    rmSync(resolve(skillsRoot, skillName), { recursive: true, force: true });
  }

  rmSync(markerPath, { force: true });

  return {
    markerPath,
    removedSkillNames: skillNames,
  };
}

export function uninstallCodexPlugin({ scope, cwd = process.cwd() }) {
  const installRoot = resolveCodexInstallRoot({ scope, cwd });
  const marketplacePath = resolveCodexMarketplacePath({ scope, cwd });
  const skillsRoot = resolveCodexSkillsRoot({ scope, cwd });
  const hadInstallRoot = existsSync(installRoot);
  const { removedSkillNames } = removeManagedCodexSkills(skillsRoot);
  const marketplaceResult = removeCodexMarketplaceEntry({ marketplacePath });

  rmSync(installRoot, { recursive: true, force: true });

  return {
    installRoot,
    marketplacePath,
    skillsRoot,
    hadInstallRoot,
    removedSkillNames,
    marketplaceChanged: marketplaceResult.changed,
  };
}

function rewriteInstalledSkillMarkdown(rawContent, pluginInstallRoot) {
  return rawContent
    .replaceAll("../../../references/shared/", "references/shared/")
    .replaceAll(
      "node ../../../scripts/scaffold-app.mjs",
      `node ${resolve(pluginInstallRoot, "scripts", "scaffold-app.mjs")}`,
    )
    .replaceAll(
      "node ../../../scripts/validate-plugin-structure.mjs",
      `node ${resolve(pluginInstallRoot, "scripts", "validate-plugin-structure.mjs")}`,
    )
    .replaceAll(
      "node ../../../scripts/doctor.mjs",
      `node ${resolve(pluginInstallRoot, "scripts", "doctor.mjs")}`,
    );
}

export function syncCodexSkills({
  pluginInstallRoot,
  skillsRoot,
}) {
  const sourceSkillsRoot = resolve(pluginInstallRoot, "skills", "codex");
  const markerPath = resolve(skillsRoot, CODEX_SKILL_MARKER_FILE);
  const nextManagedSkillNames = MANAGED_CODEX_SKILLS;

  mkdirSync(skillsRoot, { recursive: true });

  const previousManagedSkillNames = existsSync(markerPath)
    ? JSON.parse(readFileSync(markerPath, "utf8"))
    : HIDDEN_CODEX_SKILLS;

  for (const staleSkill of previousManagedSkillNames) {
    rmSync(resolve(skillsRoot, staleSkill), { recursive: true, force: true });
  }

  for (const skillName of PUBLIC_CODEX_SKILLS) {
    const sourceSkillRoot = resolve(sourceSkillsRoot, skillName);
    const targetSkillRoot = resolve(skillsRoot, skillName);
    const sourceSkillFile = resolve(sourceSkillRoot, "SKILL.md");
    const targetSkillFile = resolve(targetSkillRoot, "SKILL.md");

    rmSync(targetSkillRoot, { recursive: true, force: true });
    cpSync(sourceSkillRoot, targetSkillRoot, { recursive: true });

    const skillContent = readFileSync(sourceSkillFile, "utf8");
    const rewritten = rewriteInstalledSkillMarkdown(skillContent, pluginInstallRoot);
    writeFileSync(targetSkillFile, rewritten);
  }

  writeFileSync(markerPath, JSON.stringify(nextManagedSkillNames, null, 2) + "\n");
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "pipe",
    encoding: "utf8",
    ...options,
  });

  return {
    ...result,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

export function runCommandOrThrow(command, args, options = {}) {
  const result = runCommand(command, args, options);
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || result.stdout.trim() || `${command} failed.`);
  }
  return result;
}

function ensureCommand(command) {
  const result = runCommand(command, ["--help"]);
  if (result.status !== 0) {
    throw new Error(`${command} CLI is not available in PATH.`);
  }
}

function getClaudeMarketplaces(cwd) {
  const result = runCommand("claude", ["plugin", "marketplace", "list", "--json"], { cwd });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || "Failed to inspect Claude marketplaces.");
  }

  return JSON.parse(result.stdout);
}

function getClaudeInstalledPlugins(cwd) {
  const result = runCommand("claude", ["plugin", "list", "--json"], { cwd });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || "Failed to inspect Claude plugins.");
  }

  return JSON.parse(result.stdout);
}

function runClaudeStep(args, cwd) {
  const result = spawnSync("claude", args, {
    cwd,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`Claude command failed: claude ${args.join(" ")}`);
  }
}

export function mapScopeToClaudeScope(scope) {
  return scope === "global" ? "user" : "project";
}

export function installClaudePlugin({ scope, cwd = process.cwd() }) {
  ensureCommand("claude");

  const claudeScope = mapScopeToClaudeScope(scope);
  const marketplaces = getClaudeMarketplaces(cwd);
  const matchingMarketplace = marketplaces.find((item) => item?.repo === GITHUB_REPOSITORY);
  const hasMarketplace = Boolean(matchingMarketplace);

  if (!hasMarketplace) {
    runClaudeStep(
      ["plugin", "marketplace", "add", GITHUB_REPOSITORY, "--scope", claudeScope],
      cwd,
    );
  }

  const installedPlugins = getClaudeInstalledPlugins(cwd);
  const existing = installedPlugins.find(
    (item) => item?.id?.startsWith(`${PLUGIN_NAME}@`) && item?.scope === claudeScope,
  );
  const marketplaceName = matchingMarketplace?.name ?? PLUGIN_NAME;
  const pluginSpecifier = existing?.id ?? `${PLUGIN_NAME}@${marketplaceName}`;

  if (existing) {
    runClaudeStep(["plugin", "update", pluginSpecifier, "--scope", claudeScope], cwd);
  } else {
    runClaudeStep(["plugin", "install", pluginSpecifier, "--scope", claudeScope], cwd);
  }

  return {
    scope: claudeScope,
    marketplace: GITHUB_REPOSITORY,
  };
}

function resolveClaudePluginsRoot() {
  return resolve(os.homedir(), ".claude", "plugins");
}

function resolveClaudeCacheRoot() {
  return resolve(resolveClaudePluginsRoot(), "cache", PLUGIN_NAME);
}

function resolveClaudeMarketplaceRoot() {
  return resolve(resolveClaudePluginsRoot(), "marketplaces", PLUGIN_NAME);
}

export function uninstallClaudePlugin({ scope, cwd = process.cwd() }) {
  ensureCommand("claude");

  const claudeScope = mapScopeToClaudeScope(scope);
  const installedPlugins = getClaudeInstalledPlugins(cwd);
  const pluginIds = Array.from(
    new Set(
      installedPlugins
        .filter((item) => item?.id?.startsWith(`${PLUGIN_NAME}@`) && item?.scope === claudeScope)
        .map((item) => item.id),
    ),
  );

  for (const pluginId of pluginIds) {
    runClaudeStep(["plugin", "uninstall", pluginId, "--scope", claudeScope], cwd);
  }

  return {
    scope: claudeScope,
    removedPluginIds: pluginIds,
  };
}

export function cleanupClaudePluginArtifacts({ cwd = process.cwd() }) {
  ensureCommand("claude");

  const remainingPlugins = getClaudeInstalledPlugins(cwd).filter((item) =>
    item?.id?.startsWith(`${PLUGIN_NAME}@`),
  );
  if (remainingPlugins.length > 0) {
    return {
      removedMarketplaceNames: [],
      removedCacheRoot: false,
      removedMarketplaceRoot: false,
      remainingPluginIds: remainingPlugins.map((item) => item.id),
    };
  }

  const marketplaces = getClaudeMarketplaces(cwd);
  const marketplaceNames = Array.from(
    new Set(
      marketplaces
        .filter((item) => item?.repo === GITHUB_REPOSITORY || item?.name === PLUGIN_NAME)
        .map((item) => item?.name)
        .filter(Boolean),
    ),
  );

  for (const marketplaceName of marketplaceNames) {
    runClaudeStep(["plugin", "marketplace", "remove", marketplaceName], cwd);
  }

  const cacheRoot = resolveClaudeCacheRoot();
  const marketplaceRoot = resolveClaudeMarketplaceRoot();
  const hadCacheRoot = existsSync(cacheRoot);
  const hadMarketplaceRoot = existsSync(marketplaceRoot);
  rmSync(cacheRoot, { recursive: true, force: true });
  rmSync(marketplaceRoot, { recursive: true, force: true });

  return {
    removedMarketplaceNames: marketplaceNames,
    removedCacheRoot: hadCacheRoot,
    removedMarketplaceRoot: hadMarketplaceRoot,
    remainingPluginIds: [],
  };
}

export function resolveGlobalNpmPrefix(env = process.env, cwd = process.cwd()) {
  if (env.npm_config_prefix) {
    return env.npm_config_prefix;
  }

  return runCommandOrThrow("npm", ["prefix", "-g"], { cwd, env }).stdout.trim();
}

export function resolveGlobalBinaryPath(command, env = process.env, cwd = process.cwd()) {
  const prefix = resolveGlobalNpmPrefix(env, cwd);
  return process.platform === "win32"
    ? resolve(prefix, `${command}.cmd`)
    : resolve(prefix, "bin", command);
}

export function hasGlobalBinary(command, env = process.env, cwd = process.cwd()) {
  return existsSync(resolveGlobalBinaryPath(command, env, cwd));
}

export function resolveGlobalNpmRoot(env = process.env, cwd = process.cwd()) {
  return runCommandOrThrow("npm", ["root", "-g"], { cwd, env }).stdout.trim();
}

export function getGlobalInstalledPackageVersion(packageName, env = process.env, cwd = process.cwd()) {
  const packageJsonPath = resolve(resolveGlobalNpmRoot(env, cwd), packageName, "package.json");
  if (!existsSync(packageJsonPath)) {
    return null;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  return packageJson.version ?? null;
}

export function updateGlobalPackage({
  packageSpec = `${PACKAGE_NAME}@latest`,
  env = process.env,
  cwd = process.cwd(),
}) {
  const result = spawnSync("npm", ["install", "-g", packageSpec], {
    cwd,
    env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Failed to update global package: ${packageSpec}`);
  }

  return {
    packageSpec,
    binaryPath: resolveGlobalBinaryPath("tfb", env, cwd),
  };
}

export function installGlobalPackage({
  packageSpec,
  env = process.env,
  cwd = process.cwd(),
}) {
  const result = spawnSync("npm", ["install", "-g", packageSpec], {
    cwd,
    env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Failed to install global package: ${packageSpec}`);
  }

  return {
    packageSpec,
    binaryPath: resolveGlobalBinaryPath("tfb", env, cwd),
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function upsertManagedBlock(filePath, existingContent, managedBlock) {
  const blockPattern = new RegExp(
    `${escapeRegExp(MANAGED_BLOCK_START)}[\\s\\S]*?${escapeRegExp(MANAGED_BLOCK_END)}`,
    "m",
  );

  const nextContent = blockPattern.test(existingContent)
    ? existingContent.replace(blockPattern, managedBlock)
    : `${existingContent.replace(/\s*$/, "")}${existingContent.trim().length > 0 ? "\n\n" : ""}${managedBlock}\n`;

  if (nextContent !== existingContent) {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, nextContent);
  }

  return {
    path: filePath,
    changed: nextContent !== existingContent,
  };
}

function buildPosixManagedBlock() {
  return [
    MANAGED_BLOCK_START,
    'if [ -z "$NVM_DIR" ] && [ -d "$HOME/.nvm" ]; then',
    '  export NVM_DIR="$HOME/.nvm"',
    "fi",
    'if [ -n "$NVM_DIR" ] && [ -s "$NVM_DIR/nvm.sh" ]; then',
    '  . "$NVM_DIR/nvm.sh"',
    "fi",
    'if command -v npm >/dev/null 2>&1; then',
    '  _tfb_npm_bin="$(npm prefix -g 2>/dev/null)/bin"',
    '  case ":$PATH:" in',
    '    *":$_tfb_npm_bin:"*) ;;',
    '    *) export PATH="$_tfb_npm_bin:$PATH" ;;',
    "  esac",
    "  unset _tfb_npm_bin",
    "fi",
    MANAGED_BLOCK_END,
  ].join("\n");
}

function buildFishManagedBlock() {
  return [
    MANAGED_BLOCK_START,
    "if command -sq npm",
    "  set -l _tfb_npm_bin (npm prefix -g ^/dev/null)",
    "  if test -n \"$_tfb_npm_bin\"",
    "    if not contains -- $_tfb_npm_bin $PATH",
    "      set -gx PATH $_tfb_npm_bin $PATH",
    "    end",
    "  end",
    "end",
    MANAGED_BLOCK_END,
  ].join("\n");
}

function resolveShellProfileTarget({
  shell,
  homeDir,
  platform,
}) {
  const normalizedShell = shell.toLowerCase();
  const zshrcPath = resolve(homeDir, ".zshrc");
  const bashrcPath = resolve(homeDir, ".bashrc");
  const bashProfilePath = resolve(homeDir, ".bash_profile");
  const profilePath = resolve(homeDir, ".profile");
  const fishConfigPath = resolve(homeDir, ".config", "fish", "config.fish");

  if (normalizedShell.includes("zsh")) {
    return {
      path: zshrcPath,
      shellName: "zsh",
      refreshHint: "Run `source ~/.zshrc` or open a new terminal to use `tfb` immediately.",
      managedBlock: buildPosixManagedBlock(),
    };
  }

  if (normalizedShell.includes("bash")) {
    const targetPath =
      existsSync(bashProfilePath)
        ? bashProfilePath
        : existsSync(bashrcPath)
          ? bashrcPath
          : platform === "darwin"
            ? bashProfilePath
            : bashrcPath;

    return {
      path: targetPath,
      shellName: "bash",
      refreshHint:
        targetPath.endsWith(".bash_profile")
          ? "Run `source ~/.bash_profile` or open a new terminal to use `tfb` immediately."
          : "Run `source ~/.bashrc` or open a new terminal to use `tfb` immediately.",
      managedBlock: buildPosixManagedBlock(),
    };
  }

  if (normalizedShell.includes("fish")) {
    return {
      path: fishConfigPath,
      shellName: "fish",
      refreshHint:
        "Run `source ~/.config/fish/config.fish` or open a new terminal to use `tfb` immediately.",
      managedBlock: buildFishManagedBlock(),
    };
  }

  if (existsSync(profilePath)) {
    return {
      path: profilePath,
      shellName: "sh",
      refreshHint: "Run `source ~/.profile` or open a new terminal to use `tfb` immediately.",
      managedBlock: buildPosixManagedBlock(),
    };
  }

  if (existsSync(bashProfilePath)) {
    return {
      path: bashProfilePath,
      shellName: "bash",
      refreshHint: "Run `source ~/.bash_profile` or open a new terminal to use `tfb` immediately.",
      managedBlock: buildPosixManagedBlock(),
    };
  }

  if (existsSync(bashrcPath)) {
    return {
      path: bashrcPath,
      shellName: "bash",
      refreshHint: "Run `source ~/.bashrc` or open a new terminal to use `tfb` immediately.",
      managedBlock: buildPosixManagedBlock(),
    };
  }

  if (existsSync(fishConfigPath)) {
    return {
      path: fishConfigPath,
      shellName: "fish",
      refreshHint:
        "Run `source ~/.config/fish/config.fish` or open a new terminal to use `tfb` immediately.",
      managedBlock: buildFishManagedBlock(),
    };
  }

  return {
    path: profilePath,
    shellName: "sh",
    refreshHint:
      "Run `source ~/.profile` or open a new terminal to use `tfb` immediately.",
    managedBlock: buildPosixManagedBlock(),
  };
}

function ensureWindowsPathRegistration({
  env,
  cwd,
}) {
  const npmPrefix = resolveGlobalNpmPrefix(env, cwd);
  const escapedPrefix = npmPrefix.replace(/'/g, "''");
  const command = [
    `$current = [Environment]::GetEnvironmentVariable('Path', 'User')`,
    "$segments = @()",
    "if ($current) { $segments = $current -split ';' | Where-Object { $_ } }",
    `$target = '${escapedPrefix}'`,
    "$normalizedTarget = $target.TrimEnd('\\')",
    "$alreadyPresent = $segments | Where-Object { $_.TrimEnd('\\') -ieq $normalizedTarget }",
    "if (-not $alreadyPresent) {",
    "  $next = if ($segments.Count -gt 0) { $target + ';' + ($segments -join ';') } else { $target }",
    "  [Environment]::SetEnvironmentVariable('Path', $next, 'User')",
    "  [Console]::WriteLine('updated')",
    "} else {",
    "  [Console]::WriteLine('unchanged')",
    "}",
  ].join("; ");

  for (const shellCommand of ["powershell", "pwsh"]) {
    const result = runCommand(shellCommand, ["-NoProfile", "-Command", command], { cwd, env });

    if (result.status === 0) {
      const changed = result.stdout.trim() === "updated";

      return {
        changed,
        targets: ["Windows user PATH"],
        refreshHint:
          "Open a new PowerShell or Command Prompt window to use `tfb` immediately.",
      };
    }

    if (result.error?.code !== "ENOENT") {
      throw new Error(result.stderr.trim() || `Failed to update the Windows user PATH with ${shellCommand}.`);
    }
  }

  throw new Error("Neither PowerShell nor pwsh is available to update the Windows user PATH.");
}

export function ensureEnvironmentRegistration({
  env = process.env,
  homeDir = os.homedir(),
  platform = process.platform,
  cwd = process.cwd(),
}) {
  if (platform === "win32") {
    return ensureWindowsPathRegistration({
      env,
      cwd,
    });
  }

  const shell = env.SHELL ?? "";
  const target = resolveShellProfileTarget({
    shell,
    homeDir,
    platform,
  });
  const existing = existsSync(target.path) ? readFileSync(target.path, "utf8") : "";
  const registration = upsertManagedBlock(target.path, existing, target.managedBlock);

  return {
    changed: registration.changed,
    targets: [registration.path],
    refreshHint: target.refreshHint,
  };
}

export function ensureZshRegistration(args = {}) {
  return ensureEnvironmentRegistration(args);
}

export function runUpdatedBinary({
  binaryPath,
  args,
  env = process.env,
  cwd = process.cwd(),
}) {
  const result = spawnSync(binaryPath, args, {
    cwd,
    env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Updated binary failed: ${binaryPath}`);
  }
}

export function runTriphosInit({
  packageRoot,
  target,
  name = "triphos-frontend-app",
  installDeps = true,
  cwd = process.cwd(),
}) {
  const scriptPath = resolve(resolvePluginSourceRoot(packageRoot), "scripts", "scaffold-app.mjs");
  const args = ["node", scriptPath, "--target", target, "--name", name];

  if (installDeps) {
    args.push("--install");
  }

  const result = spawnSync(args[0], args.slice(1), {
    cwd,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error("Triphos app scaffold failed.");
  }
}

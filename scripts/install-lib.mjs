#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import { dirname, resolve } from "node:path";

export const PLUGIN_NAME = "triphos-frontend-bootstrap";
export const PACKAGE_NAME = "@jigoooo/triphos-frontend-bootstrap";
export const GITHUB_REPOSITORY = "Jigoooo/triphos-frontend-bootstrap";
const ZSH_BLOCK_START = "# >>> triphos-frontend-bootstrap >>>";
const ZSH_BLOCK_END = "# <<< triphos-frontend-bootstrap <<<";
const PUBLIC_CODEX_SKILLS = [
  "triphos-frontend-init",
  "triphos-fsd-refactor",
  "triphos-react-lint-rules",
  "triphos-api-client-setup",
  "triphos-fsd-skill-update",
];
const HIDDEN_CODEX_SKILLS = [
  "triphos-frontend-bootstrap",
  "triphos-frontend-doctor",
  "triphos-theme-setup",
];

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
  const sharedReferencesRoot = resolve(pluginInstallRoot, "references", "shared");

  mkdirSync(skillsRoot, { recursive: true });

  for (const hiddenSkill of HIDDEN_CODEX_SKILLS) {
    rmSync(resolve(skillsRoot, hiddenSkill), { recursive: true, force: true });
  }

  for (const skillName of PUBLIC_CODEX_SKILLS) {
    const sourceSkillRoot = resolve(sourceSkillsRoot, skillName);
    const targetSkillRoot = resolve(skillsRoot, skillName);
    const sourceSkillFile = resolve(sourceSkillRoot, "SKILL.md");
    const targetSkillFile = resolve(targetSkillRoot, "SKILL.md");

    rmSync(targetSkillRoot, { recursive: true, force: true });
    mkdirSync(targetSkillRoot, { recursive: true });

    if (existsSync(resolve(sourceSkillRoot, "agents"))) {
      cpSync(resolve(sourceSkillRoot, "agents"), resolve(targetSkillRoot, "agents"), {
        recursive: true,
      });
    }

    if (existsSync(sharedReferencesRoot)) {
      cpSync(sharedReferencesRoot, resolve(targetSkillRoot, "references", "shared"), {
        recursive: true,
      });
    }

    const skillContent = readFileSync(sourceSkillFile, "utf8");
    const rewritten = rewriteInstalledSkillMarkdown(skillContent, pluginInstallRoot);
    writeFileSync(targetSkillFile, rewritten);
  }
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

export function ensureZshRegistration({
  env = process.env,
  homeDir = os.homedir(),
}) {
  const shell = env.SHELL ?? "";
  const zshrcPath = resolve(homeDir, ".zshrc");
  const shouldManageZsh = shell.includes("zsh") || existsSync(zshrcPath);

  if (!shouldManageZsh) {
    return null;
  }

  const existing = existsSync(zshrcPath) ? readFileSync(zshrcPath, "utf8") : "";
  const managedBlock = [
    ZSH_BLOCK_START,
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
    ZSH_BLOCK_END,
  ].join("\n");

  const blockPattern = new RegExp(
    `${ZSH_BLOCK_START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${ZSH_BLOCK_END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    "m",
  );

  const nextContent = blockPattern.test(existing)
    ? existing.replace(blockPattern, managedBlock)
    : `${existing.replace(/\s*$/, "")}${existing.trim().length > 0 ? "\n\n" : ""}${managedBlock}\n`;

  if (nextContent !== existing) {
    writeFileSync(zshrcPath, nextContent);
  }

  return {
    zshrcPath,
    changed: nextContent !== existing,
  };
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

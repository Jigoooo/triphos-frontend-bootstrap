#!/usr/bin/env node

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

function runGit(cwd, args, { allowFailure = false, env = process.env } = {}) {
  const result = spawnSync("git", args, {
    cwd,
    env,
    encoding: "utf8",
    stdio: "pipe",
  });

  if (!allowFailure && result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(output || `git ${args.join(" ")} failed`);
  }

  return result;
}

export function getGitRoot(targetDir) {
  const result = runGit(targetDir, ["rev-parse", "--show-toplevel"], {
    allowFailure: true,
  });

  if (result.status !== 0) {
    return null;
  }

  return result.stdout.trim();
}

export function isInsideGitRepo(targetDir) {
  return getGitRoot(targetDir) !== null;
}

export function shouldInitializeGit(targetDir) {
  return !existsSync(resolve(targetDir, ".git")) && !isInsideGitRepo(targetDir);
}

export function initializeGitRepo(targetDir) {
  runGit(targetDir, ["init"]);
}

function resolveBootstrapIdentity(targetDir) {
  const nameResult = runGit(targetDir, ["config", "--get", "user.name"], {
    allowFailure: true,
  });
  const emailResult = runGit(targetDir, ["config", "--get", "user.email"], {
    allowFailure: true,
  });

  return {
    name: nameResult.status === 0 ? nameResult.stdout.trim() : "Triphos Bootstrap",
    email: emailResult.status === 0 ? emailResult.stdout.trim() : "triphos-bootstrap@local.invalid",
  };
}

export function hasTrackedChanges(targetDir) {
  const result = runGit(targetDir, ["status", "--short"], { allowFailure: true });
  if (result.status !== 0) {
    return false;
  }

  return result.stdout.trim().length > 0;
}

export function createInitialCommit(targetDir, message = "chore: initialize Triphos frontend app") {
  runGit(targetDir, ["add", "-A"]);

  if (!hasTrackedChanges(targetDir)) {
    return false;
  }

  const identity = resolveBootstrapIdentity(targetDir);
  runGit(targetDir, ["commit", "-m", message], {
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: identity.name,
      GIT_AUTHOR_EMAIL: identity.email,
      GIT_COMMITTER_NAME: identity.name,
      GIT_COMMITTER_EMAIL: identity.email,
    },
  });

  return true;
}

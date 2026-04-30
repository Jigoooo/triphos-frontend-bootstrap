#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_NAME = "@jigoooo/triphos-frontend-bootstrap";
const DEFAULT_REMOTE = process.env.TRIPHOS_RELEASE_REMOTE ?? "origin";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    const detail = result.stderr.trim() || result.stdout.trim();
    throw new Error(detail || `${command} ${args.join(" ")} failed`);
  }

  return result.stdout.trim();
}

function readPackageJson(repoRoot) {
  return JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8"));
}

export function parseRemoteHead(output) {
  const lines = output.split(/\r?\n/).filter(Boolean);
  const refLine = lines.find((line) => line.startsWith("ref: "));
  const shaLine = lines.find((line) => line.endsWith("\tHEAD") && !line.startsWith("ref: "));

  const branch = refLine?.match(/^ref: refs\/heads\/(.+)\tHEAD$/)?.[1] ?? null;
  const sha = shaLine?.split(/\s+/)[0] ?? null;

  return {
    branch,
    sha,
  };
}

export function parseRemoteTag(output, tagName) {
  const lines = output.split(/\r?\n/).filter(Boolean);
  let directSha = null;
  let peeledSha = null;

  for (const line of lines) {
    const [sha, ref] = line.split(/\s+/);
    if (ref === `refs/tags/${tagName}`) {
      directSha = sha;
    }
    if (ref === `refs/tags/${tagName}^{}`) {
      peeledSha = sha;
    }
  }

  return peeledSha ?? directSha;
}

export function normalizeNpmVersion(rawValue) {
  return JSON.parse(rawValue);
}

function getLocalHead() {
  return run("git", ["rev-parse", "HEAD"]);
}

function assertCleanWorkingTree() {
  const status = run("git", ["status", "--porcelain"]);

  if (status) {
    throw new Error(
      [
        "Working tree must be clean before publishing.",
        "Commit or discard local changes first.",
        status,
      ].join("\n"),
    );
  }
}

function getRemoteHead(remote) {
  return parseRemoteHead(run("git", ["ls-remote", "--symref", remote, "HEAD"]));
}

function getRemoteTag(remote, tagName) {
  return parseRemoteTag(
    run("git", ["ls-remote", remote, `refs/tags/${tagName}`, `refs/tags/${tagName}^{}`]),
    tagName,
  );
}

function assertRemoteReleaseState({ remote, version, localHead }) {
  const tagName = `v${version}`;
  const remoteHead = getRemoteHead(remote);
  const remoteTagSha = getRemoteTag(remote, tagName);

  if (!remoteHead.branch || !remoteHead.sha) {
    throw new Error(`Could not resolve ${remote}/HEAD.`);
  }

  if (remoteHead.sha !== localHead) {
    throw new Error(
      [
        `${remote}/${remoteHead.branch} is not at the current release commit.`,
        `Expected: ${localHead}`,
        `Actual:   ${remoteHead.sha}`,
        "Push the release commit to the GitHub default branch before publishing; Claude plugin updates read that branch, not npm.",
      ].join("\n"),
    );
  }

  if (remoteTagSha !== localHead) {
    throw new Error(
      [
        `${remote}/${tagName} is missing or does not point at the current release commit.`,
        `Expected: ${localHead}`,
        `Actual:   ${remoteTagSha ?? "missing"}`,
        `Create and push ${tagName} before publishing.`,
      ].join("\n"),
    );
  }

  return {
    branch: remoteHead.branch,
    tagName,
  };
}

function getNpmLatestVersion() {
  return normalizeNpmVersion(run("npm", ["view", PACKAGE_NAME, "version", "--json"]));
}

function assertNpmLatestVersion(version) {
  const latestVersion = getNpmLatestVersion();

  if (latestVersion !== version) {
    throw new Error(
      [
        `npm latest for ${PACKAGE_NAME} is not ${version}.`,
        `Expected: ${version}`,
        `Actual:   ${latestVersion}`,
      ].join("\n"),
    );
  }
}

function main() {
  const mode = process.argv[2] ?? "verify";
  const repoRoot = process.cwd();
  const packageJson = readPackageJson(repoRoot);
  const version = packageJson.version;
  const localHead = getLocalHead();

  assertCleanWorkingTree();
  const remoteState = assertRemoteReleaseState({
    remote: DEFAULT_REMOTE,
    version,
    localHead,
  });

  if (mode === "prepublish") {
    console.log(
      `Release preflight ok: ${DEFAULT_REMOTE}/${remoteState.branch} and ${remoteState.tagName} point at ${localHead}.`,
    );
    return;
  }

  if (mode === "verify") {
    assertNpmLatestVersion(version);
    console.log(
      `Release verified: npm latest, ${DEFAULT_REMOTE}/${remoteState.branch}, and ${remoteState.tagName} are aligned at ${version}.`,
    );
    return;
  }

  throw new Error(`Unsupported release guard mode: ${mode}`);
}

const currentModulePath = fileURLToPath(import.meta.url);

if (process.argv[1] && resolve(process.argv[1]) === currentModulePath) {
  main();
}

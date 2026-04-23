#!/usr/bin/env node

import { resolve } from "node:path";

import {
  createInitialCommit,
  initializeGitRepo,
  shouldInitializeGit,
} from "./git-bootstrap-lib.mjs";

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const target = args.target ? resolve(process.cwd(), args.target) : null;

if (!target) {
  console.error("Usage: node finalize-init.mjs --target <dir>");
  process.exit(1);
}

if (!shouldInitializeGit(target)) {
  console.log("Triphos git bootstrap skipped: parent repository detected or .git already exists.");
  process.exit(0);
}

initializeGitRepo(target);
const committed = createInitialCommit(target);

if (!committed) {
  console.log("Triphos git bootstrap initialized a repository but found no commit candidates.");
  process.exit(0);
}

console.log("Triphos git bootstrap completed: standalone repository initialized with an initial commit.");

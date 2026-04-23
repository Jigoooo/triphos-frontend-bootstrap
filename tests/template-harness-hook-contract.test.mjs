import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const templateRoot = resolve(
  repoRoot,
  "plugins",
  "triphos-frontend-bootstrap",
  "templates",
  "app",
);

function read(relativePath) {
  return readFileSync(resolve(templateRoot, relativePath), "utf8");
}

test("template hooks route agents to docs and treat docs changes as verification-relevant", () => {
  const sessionStart = read("scripts/hooks/codex-session-start.mjs");
  const stopVerify = read("scripts/hooks/codex-stop-verify.mjs");
  const packageJson = JSON.parse(read("package.json"));

  assert.match(sessionStart, /docs\/README\.md/u);
  assert.match(sessionStart, /docs\/plans\/active/u);
  assert.match(stopVerify, /directories: \['src', 'scripts', 'docs', '.codex', '.claude'\]/u);
  assert.equal(packageJson.scripts["verify:plans"], "node ./scripts/verify-plans.mjs");
  assert.match(packageJson.scripts["verify:frontend"], /pnpm verify:plans/u);
});

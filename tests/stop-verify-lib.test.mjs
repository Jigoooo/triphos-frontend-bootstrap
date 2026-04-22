import assert from "node:assert/strict";
import test from "node:test";

import {
  hasRelevantChanges,
  makePathMatchers,
  parseStopHookInput,
} from "../scripts/hooks/stop-verify-lib.mjs";

test("parseStopHookInput reads valid JSON and returns null on invalid input", () => {
  assert.deepEqual(parseStopHookInput('{"stop_hook_active":true}'), {
    stop_hook_active: true,
  });
  assert.equal(parseStopHookInput("not-json"), null);
  assert.equal(parseStopHookInput(""), null);
});

test("hasRelevantChanges matches configured repo paths", () => {
  const matchers = makePathMatchers({
    directories: ["src", ".codex"],
    exact: ["package.json"],
  });

  assert.equal(hasRelevantChanges(["src/app.tsx"], matchers), true);
  assert.equal(hasRelevantChanges(["package.json"], matchers), true);
  assert.equal(hasRelevantChanges(["README.md"], matchers), false);
});

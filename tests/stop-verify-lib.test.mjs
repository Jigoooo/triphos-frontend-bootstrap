import assert from "node:assert/strict";
import test from "node:test";

import {
  formatVerificationFailureMessage,
  hasRelevantChanges,
  makePathMatchers,
  parseStopHookInput,
  truncateForTranscript,
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

test("truncateForTranscript returns short input as-is", () => {
  const out = truncateForTranscript("- foo\n- bar");
  assert.equal(out, "- foo\n- bar");
});

test("truncateForTranscript caps oversized output at 4KB and preserves error lines", () => {
  // Build a synthetic 5MB stdout where the meaningful FAIL line is past
  // line 40, so a naive head-only truncation would lose it.
  const noiseLine = "x".repeat(120);
  const longBody = Array.from({ length: 50000 }, () => noiseLine).join("\n");
  const synthetic = [
    "Header line",
    longBody,
    "FAIL: critical assertion at line 40+",
    "Error: TypeError: foo is not a function",
    "Tail line",
  ].join("\n");
  const out = truncateForTranscript(synthetic);
  assert.ok(Buffer.byteLength(out, "utf8") <= 4096, "truncated output exceeds 4KB cap");
  assert.match(out, /FAIL: critical assertion/u, "FAIL line must survive truncation");
  assert.match(out, /TypeError/u, "Error line must survive truncation");
  assert.match(out, /\(truncated/u, "truncation marker must be present");
});

test("formatVerificationFailureMessage embeds Full log path when provided", () => {
  const result = { stdout: "FAIL: something\n", stderr: "" };
  const message = formatVerificationFailureMessage(
    "repository",
    "pnpm verify:repo",
    result,
    "/abs/path/to/trace.jsonl",
  );
  assert.match(message, /Full log: \/abs\/path\/to\/trace\.jsonl/u);
  assert.match(message, /Triphos repository verification failed\./u);
  assert.match(message, /FAIL: something/u);
});

test("formatVerificationFailureMessage skips Full log line when path absent", () => {
  const result = { stdout: "FAIL: bug\n", stderr: "" };
  const message = formatVerificationFailureMessage(
    "frontend",
    "pnpm verify:frontend",
    result,
  );
  assert.doesNotMatch(message, /Full log:/u);
  assert.match(message, /Triphos frontend verification failed\./u);
});

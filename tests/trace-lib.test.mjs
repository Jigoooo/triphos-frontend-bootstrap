import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  buildTraceEntry,
  extractFailureSignature,
  isTraceInjectEnabled,
  pruneOldTraces,
  readRecentFailures,
  recordFailureTrace,
  summarizeRecentFailures,
} from "../scripts/hooks/trace-lib.mjs";

function makeTempCwd() {
  const dir = mkdtempSync(join(tmpdir(), "trace-lib-test-"));
  return {
    cwd: dir,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

test("extractFailureSignature parses validate-plugin-structure output", () => {
  const stderr = [
    "Triphos repository verification failed.",
    "Run pnpm verify:repo manually after fixing the reported issues.",
    "Triphos plugin structure check failed.",
    "- missing: /repo/AGENTS.md",
  ].join("\n");
  const sig = extractFailureSignature(stderr, "");
  assert.equal(sig, "Triphos plugin structure check failed: missing: /repo/AGENTS.md");
});

test("extractFailureSignature parses skill parity output", () => {
  const stderr = [
    "Skill parity check failed:",
    "- triphos-theme-setup: missing on codex side",
  ].join("\n");
  assert.equal(
    extractFailureSignature(stderr, ""),
    "Skill parity check failed: triphos-theme-setup: missing on codex side",
  );
});

test("extractFailureSignature parses scaffold constraint output", () => {
  const stderr = [
    "Missing required scaffold files:",
    "- src/main.tsx",
    "- src/vite-env.d.ts",
  ].join("\n");
  assert.equal(
    extractFailureSignature(stderr, ""),
    "Missing required scaffold files: src/main.tsx",
  );
});

test("extractFailureSignature ignores pnpm preface lines", () => {
  const stdout = "> @jigoooo/triphos-frontend-bootstrap@1.0.0 verify:repo /repo";
  const stderr = [
    "Disallowed className usage detected:",
    "- src/widgets/foo/ui/foo.tsx",
  ].join("\n");
  assert.equal(
    extractFailureSignature(stderr, stdout),
    "Disallowed className usage detected: src/widgets/foo/ui/foo.tsx",
  );
});

test("extractFailureSignature returns 'unparsed' when no detail line", () => {
  assert.equal(extractFailureSignature("", ""), "unparsed");
  assert.equal(extractFailureSignature("ELIFECYCLE Command failed.", ""), "unparsed");
});

test("buildTraceEntry produces a deterministic shape", () => {
  const entry = buildTraceEntry({
    surface: "claude",
    exitStatus: 1,
    verifyCommand: "pnpm verify:repo",
    changedFiles: ["AGENTS.md"],
    stderr: "Skill parity check failed:\n- foo: bar",
    stdout: "",
    now: new Date("2026-04-27T01:23:45.678Z"),
  });
  assert.deepEqual(entry, {
    ts: "2026-04-27T01:23:45.678Z",
    surface: "claude",
    exitStatus: 1,
    verifyCommand: "pnpm verify:repo",
    changedFiles: ["AGENTS.md"],
    failureSignature: "Skill parity check failed: foo: bar",
  });
});

test("recordFailureTrace writes one jsonl file under .triphos/traces", () => {
  const { cwd, cleanup } = makeTempCwd();
  try {
    const entry = buildTraceEntry({
      surface: "claude",
      exitStatus: 2,
      verifyCommand: "pnpm verify:repo",
      changedFiles: ["AGENTS.md"],
      stderr: "Skill parity check failed:\n- a: b",
      stdout: "",
      now: new Date("2026-04-27T00:00:00.000Z"),
    });
    const file = recordFailureTrace(cwd, entry);
    assert.ok(file && file.endsWith(".jsonl"), "should return jsonl path");

    const files = readdirSync(join(cwd, ".triphos/traces"));
    assert.equal(files.length, 1);

    const raw = readFileSync(file, "utf8");
    assert.equal(raw.endsWith("\n"), true);
    assert.deepEqual(JSON.parse(raw.trim()), entry);
  } finally {
    cleanup();
  }
});

test("summarizeRecentFailures returns empty string when no traces", () => {
  const { cwd, cleanup } = makeTempCwd();
  try {
    assert.equal(summarizeRecentFailures(cwd, 5), "");
  } finally {
    cleanup();
  }
});

test("summarizeRecentFailures groups duplicates and preserves first-seen order", () => {
  const { cwd, cleanup } = makeTempCwd();
  try {
    const base = {
      surface: "claude",
      exitStatus: 1,
      verifyCommand: "pnpm verify:repo",
      changedFiles: [],
      stdout: "",
    };
    const entries = [
      { ...base, stderr: "Skill parity check failed:\n- a: b", now: new Date("2026-04-27T00:00:01.000Z") },
      { ...base, stderr: "Triphos plugin structure check failed.\n- missing: AGENTS.md", now: new Date("2026-04-27T00:00:02.000Z") },
      { ...base, stderr: "Skill parity check failed:\n- a: b", now: new Date("2026-04-27T00:00:03.000Z") },
      { ...base, stderr: "Skill parity check failed:\n- a: b", now: new Date("2026-04-27T00:00:04.000Z") },
      { ...base, stderr: "Disallowed className usage detected:\n- foo.tsx", now: new Date("2026-04-27T00:00:05.000Z") },
    ];
    for (const seed of entries) {
      recordFailureTrace(cwd, buildTraceEntry(seed));
    }

    const summary = summarizeRecentFailures(cwd, 5);
    const lines = summary.split("\n");
    assert.equal(lines[0], "Recent verifier failures (last 5):");
    assert.equal(lines[1], "- Skill parity check failed: a: b  ×3");
    assert.equal(lines[2], "- Triphos plugin structure check failed: missing: AGENTS.md  ×1");
    assert.equal(lines[3], "- Disallowed className usage detected: foo.tsx  ×1");
    assert.equal(lines.at(-1), "Avoid repeating the same failure. Run pnpm verify:repo before declaring done.");
  } finally {
    cleanup();
  }
});

test("pruneOldTraces deletes files older than retention window", () => {
  const { cwd, cleanup } = makeTempCwd();
  try {
    const base = {
      surface: "claude",
      exitStatus: 1,
      verifyCommand: "pnpm verify:repo",
      changedFiles: [],
      stderr: "Skill parity check failed:\n- a: b",
      stdout: "",
    };
    const oldFile = recordFailureTrace(cwd, buildTraceEntry({ ...base, now: new Date("2025-01-01T00:00:00.000Z") }));
    const freshFile = recordFailureTrace(cwd, buildTraceEntry({ ...base, now: new Date() }));

    const ancientMtime = new Date("2025-01-01T00:00:00.000Z");
    utimesSync(oldFile, ancientMtime, ancientMtime);

    const removed = pruneOldTraces(cwd, { retentionDays: 30 });
    assert.equal(removed, 1);

    const remaining = readdirSync(join(cwd, ".triphos/traces"));
    assert.deepEqual(remaining, [freshFile.split("/").at(-1)]);
  } finally {
    cleanup();
  }
});

test("pruneOldTraces returns 0 when directory is missing or empty", () => {
  const { cwd, cleanup } = makeTempCwd();
  try {
    assert.equal(pruneOldTraces(cwd), 0);
  } finally {
    cleanup();
  }
});

test("isTraceInjectEnabled honours TRIPHOS_TRACE_INJECT toggle", () => {
  assert.equal(isTraceInjectEnabled({}), true);
  assert.equal(isTraceInjectEnabled({ TRIPHOS_TRACE_INJECT: "" }), true);
  assert.equal(isTraceInjectEnabled({ TRIPHOS_TRACE_INJECT: "1" }), true);
  assert.equal(isTraceInjectEnabled({ TRIPHOS_TRACE_INJECT: "true" }), true);
  assert.equal(isTraceInjectEnabled({ TRIPHOS_TRACE_INJECT: "0" }), false);
  assert.equal(isTraceInjectEnabled({ TRIPHOS_TRACE_INJECT: "false" }), false);
  assert.equal(isTraceInjectEnabled({ TRIPHOS_TRACE_INJECT: "OFF" }), false);
  assert.equal(isTraceInjectEnabled({ TRIPHOS_TRACE_INJECT: "no" }), false);
});

test("readRecentFailures respects limit and chronological order", () => {
  const { cwd, cleanup } = makeTempCwd();
  try {
    const base = {
      surface: "codex",
      exitStatus: 1,
      verifyCommand: "pnpm verify:repo",
      changedFiles: [],
      stderr: "Skill parity check failed:\n- a: b",
      stdout: "",
    };
    for (let i = 1; i <= 7; i += 1) {
      const now = new Date(`2026-04-27T00:00:0${i}.000Z`);
      recordFailureTrace(cwd, buildTraceEntry({ ...base, now }));
    }
    const recent = readRecentFailures(cwd, 3);
    assert.equal(recent.length, 3);
    const timestamps = recent.map((entry) => entry.ts);
    assert.deepEqual(timestamps, [
      "2026-04-27T00:00:05.000Z",
      "2026-04-27T00:00:06.000Z",
      "2026-04-27T00:00:07.000Z",
    ]);
  } finally {
    cleanup();
  }
});

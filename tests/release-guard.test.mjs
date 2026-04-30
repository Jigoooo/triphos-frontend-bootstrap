import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeNpmVersion,
  parseRemoteHead,
  parseRemoteTag,
} from "../scripts/release-guard.mjs";

test("parseRemoteHead extracts the default branch and head sha", () => {
  assert.deepEqual(
    parseRemoteHead("ref: refs/heads/master\tHEAD\nabc123\tHEAD\n"),
    {
      branch: "master",
      sha: "abc123",
    },
  );
});

test("parseRemoteTag prefers peeled annotated tag sha", () => {
  assert.equal(
    parseRemoteTag(
      "tag-object\trefs/tags/v1.2.3\ncommit-sha\trefs/tags/v1.2.3^{}\n",
      "v1.2.3",
    ),
    "commit-sha",
  );
});

test("parseRemoteTag accepts lightweight tag sha", () => {
  assert.equal(
    parseRemoteTag("commit-sha\trefs/tags/v1.2.3\n", "v1.2.3"),
    "commit-sha",
  );
});

test("normalizeNpmVersion parses npm json output", () => {
  assert.equal(normalizeNpmVersion("\"0.12.6\""), "0.12.6");
});

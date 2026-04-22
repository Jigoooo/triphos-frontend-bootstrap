import assert from "node:assert/strict";
import test from "node:test";

import { hasCodexHooksEnabled } from "../plugins/triphos-frontend-bootstrap/scripts/runtime-config.mjs";

test("hasCodexHooksEnabled detects an enabled feature flag", () => {
  assert.equal(
    hasCodexHooksEnabled("[features]\ncodex_hooks = true\n"),
    true,
  );
});

test("hasCodexHooksEnabled rejects missing or disabled feature flags", () => {
  assert.equal(hasCodexHooksEnabled("[features]\ncodex_hooks = false\n"), false);
  assert.equal(hasCodexHooksEnabled(""), false);
  assert.equal(hasCodexHooksEnabled(null), false);
});

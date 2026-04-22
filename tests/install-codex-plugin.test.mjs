import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

import {
  installCodexPlugin,
  uninstallCodexPlugin,
} from "../scripts/install-lib.mjs";

const repoRoot = resolve(import.meta.dirname, "..");

test("installCodexPlugin installs local bundle, marketplace entry, and managed skills idempotently", () => {
  const cwd = mkdtempSync(resolve(tmpdir(), "tfb-install-codex-"));

  try {
    const first = installCodexPlugin({
      packageRoot: repoRoot,
      scope: "local",
      cwd,
    });
    const second = installCodexPlugin({
      packageRoot: repoRoot,
      scope: "local",
      cwd,
    });

    assert.equal(existsSync(resolve(first.installRoot, ".codex-plugin", "plugin.json")), true);
    assert.equal(existsSync(resolve(first.skillsRoot, "triphos-frontend-init", "SKILL.md")), true);
    assert.equal(existsSync(resolve(first.skillsRoot, "triphos-frontend-adopt", "SKILL.md")), true);

    const marketplace = JSON.parse(readFileSync(first.marketplacePath, "utf8"));
    assert.deepEqual(marketplace.plugins.map((item) => item.name), ["triphos-frontend-bootstrap"]);
    assert.equal(second.installRoot, first.installRoot);

    uninstallCodexPlugin({ scope: "local", cwd });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

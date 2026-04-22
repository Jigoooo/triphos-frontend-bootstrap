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

test("installCodexPlugin supports a global-scope simulation with an injected homeDir", () => {
  const cwd = mkdtempSync(resolve(tmpdir(), "tfb-install-codex-global-cwd-"));
  const homeDir = mkdtempSync(resolve(tmpdir(), "tfb-install-codex-global-home-"));

  try {
    const result = installCodexPlugin({
      packageRoot: repoRoot,
      scope: "global",
      cwd,
      homeDir,
    });

    assert.equal(result.installRoot.startsWith(homeDir), true);
    assert.equal(result.marketplacePath.startsWith(homeDir), true);
    assert.equal(result.skillsRoot.startsWith(homeDir), true);
    assert.equal(existsSync(resolve(result.skillsRoot, "triphos-frontend-init", "SKILL.md")), true);

    const marketplace = JSON.parse(readFileSync(result.marketplacePath, "utf8"));
    assert.deepEqual(marketplace.plugins.map((item) => item.name), ["triphos-frontend-bootstrap"]);

    uninstallCodexPlugin({ scope: "global", cwd, homeDir });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
    rmSync(homeDir, { recursive: true, force: true });
  }
});

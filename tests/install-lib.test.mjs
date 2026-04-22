import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";

import { uninstallCodexPlugin } from "../scripts/install-lib.mjs";

const MARKER_FILE = ".managed-triphos-frontend-bootstrap-skills.json";

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
}

test("uninstallCodexPlugin removes managed local plugin state and keeps unrelated entries", () => {
  const cwd = mkdtempSync(resolve(tmpdir(), "tfb-uninstall-local-"));

  try {
    const installRoot = resolve(cwd, ".triphos", "plugins", "triphos-frontend-bootstrap");
    const skillsRoot = resolve(cwd, ".codex", "skills");
    const marketplacePath = resolve(cwd, ".agents", "plugins", "marketplace.json");
    const managedSkills = [
      "triphos-frontend-init",
      "triphos-frontend-bootstrap",
      "triphos-frontend-doctor",
    ];

    mkdirSync(installRoot, { recursive: true });
    writeFileSync(resolve(installRoot, "installed.txt"), "present\n");
    mkdirSync(resolve(skillsRoot, "keep-me"), { recursive: true });

    for (const skillName of managedSkills) {
      mkdirSync(resolve(skillsRoot, skillName), { recursive: true });
    }

    writeJson(resolve(skillsRoot, MARKER_FILE), managedSkills);
    writeJson(marketplacePath, {
      name: "local-plugins",
      interface: {
        displayName: "Local Plugins",
      },
      plugins: [
        {
          name: "triphos-frontend-bootstrap",
          source: {
            source: "local",
            path: installRoot,
          },
        },
        {
          name: "keep-plugin",
          source: {
            source: "local",
            path: resolve(cwd, "keep-plugin"),
          },
        },
      ],
    });

    const result = uninstallCodexPlugin({ scope: "local", cwd });

    assert.equal(result.hadInstallRoot, true);
    assert.equal(existsSync(installRoot), false);
    assert.equal(existsSync(resolve(skillsRoot, MARKER_FILE)), false);
    assert.equal(existsSync(resolve(skillsRoot, "keep-me")), true);

    for (const skillName of managedSkills) {
      assert.equal(existsSync(resolve(skillsRoot, skillName)), false);
    }

    const payload = JSON.parse(readFileSync(marketplacePath, "utf8"));
    assert.deepEqual(payload.plugins.map((item) => item.name), ["keep-plugin"]);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("uninstallCodexPlugin falls back to the known managed skills when the marker is missing", () => {
  const cwd = mkdtempSync(resolve(tmpdir(), "tfb-uninstall-fallback-"));

  try {
    const skillsRoot = resolve(cwd, ".codex", "skills");
    const managedSkills = [
      "triphos-frontend-init",
      "triphos-api-client-setup",
      "triphos-frontend-bootstrap",
      "triphos-frontend-doctor",
    ];

    for (const skillName of managedSkills) {
      mkdirSync(resolve(skillsRoot, skillName), { recursive: true });
    }
    mkdirSync(resolve(skillsRoot, "keep-me"), { recursive: true });

    uninstallCodexPlugin({ scope: "local", cwd });

    for (const skillName of managedSkills) {
      assert.equal(existsSync(resolve(skillsRoot, skillName)), false);
    }
    assert.equal(existsSync(resolve(skillsRoot, "keep-me")), true);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

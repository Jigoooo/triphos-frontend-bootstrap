import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

function read(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

test("README and plugin prompts keep init as the default harness target", () => {
  const readme = read("README.md");
  const readmeKo = read("README.ko.md");
  const pluginJson = JSON.parse(
    read("plugins/triphos-frontend-bootstrap/.codex-plugin/plugin.json"),
  );

  assert.match(readme, /default target for the strong Triphos harness/u);
  assert.match(readme, /explicit `triphos-frontend-adopt` migration/u);
  assert.match(readmeKo, /기본 대상은 이 경로로 생성된 저장소/u);
  assert.match(readmeKo, /명시적으로 호출한 경우에만/u);
  assert.match(
    pluginJson.interface.defaultPrompt.join("\n"),
    /Generated apps are the default target for the strong harness/u,
  );
  assert.match(
    pluginJson.interface.defaultPrompt.join("\n"),
    /explicitly want to migrate an existing frontend project/u,
  );
});

test("init/adopt skills keep generated-project default and explicit adopt migration wording", () => {
  const initSkill = read("plugins/triphos-frontend-bootstrap/skills/codex/triphos-frontend-init/SKILL.md");
  const adoptSkill = read("plugins/triphos-frontend-bootstrap/skills/codex/triphos-frontend-adopt/SKILL.md");

  assert.match(initSkill, /강한 Triphos 하네스의 기본 대상/u);
  assert.match(initSkill, /docs\/` system-of-record/u);
  assert.match(adoptSkill, /opt-in migration surface/u);
  assert.match(adoptSkill, /명시적으로 호출한 경우에만/u);
});

test("init skill gates target and SSR decisions before scaffolding", () => {
  const initSkill = read("plugins/triphos-frontend-bootstrap/skills/codex/triphos-frontend-init/SKILL.md");

  assert.match(initSkill, /현재 작업 디렉터리를 대상 디렉터리로 사용/u);
  assert.match(initSkill, /패키지명만 따로 묻지 않는다/u);
  assert.match(initSkill, /자동 기본값으로 선택하지 않는다/u);
  assert.match(initSkill, /request_user_input.*일반 메시지로 질문하고/u);
  assert.match(initSkill, /"답을 못 들으면 SPA"로 자동 진행하지 않는다/u);
});

---
name: triphos-frontend-init
description: 새 디렉터리에 Triphos 프론트엔드 앱을 생성한다. 템플릿에는 shared/api, auth/token/member baseline, auth-aware api-bootstrap, repo-local Codex/Claude hooks, verifier scripts가 기본 포함된다.
argument-hint: "[target-directory]"
---

# triphos-frontend-init

## 먼저 읽기

- [../../../references/shared/stack.md](../../../references/shared/stack.md)
- [../../../references/shared/init-contract.md](../../../references/shared/init-contract.md)
- [../../../references/shared/latest-stack.md](../../../references/shared/latest-stack.md)
- [../../../references/shared/frontend-policy.md](../../../references/shared/frontend-policy.md)
- [../../../references/internal/frontend-doctor.md](../../../references/internal/frontend-doctor.md)

## 워크플로우

1. 환경이 불명확하면 `validate-plugin-structure.mjs`와 `doctor.mjs`를 먼저 실행한다.
2. 대상 디렉터리가 새 디렉터리이거나 허용된 런타임 상태물만 포함하는지 확인한다.
3. `node ../../../scripts/scaffold-app.mjs --target <directory> --name <package-name> --install`를 실행한다.
4. 생성 직후 `pnpm verify:frontend`와 `pnpm build` 또는 `pnpm typecheck`로 검증한다.

## 템플릿 계약

- 이 스킬로 생성된 저장소가 강한 Triphos 하네스의 기본 대상이다.
- 생성 결과에는 `docs/` system-of-record, repo-local hooks, verifier scripts, browser harness scripts가 기본 포함된다.
- `src/shared/api/`와 `apiWithAdapter`가 기본 포함된다.
- `entities/auth`, token store, 최소 member store, auth-aware `api-bootstrap`이 기본 포함된다.
- query key는 `@lukemorales/query-key-factory`로 관리하고, entity `model/`에 `query-keys.ts`, `query-options.ts`, `mutation-options.ts`가 기본 포함된다.
- `.codex/hooks.json`, `.claude/settings.json`, verifier scripts가 기본 포함된다.
- 더 깊은 entity API 추가나 raw API migration은 `triphos-api-client-setup`이 담당한다.
- 기존 프로젝트를 동일 baseline으로 올릴 때는 `triphos-frontend-adopt`를 사용한다.

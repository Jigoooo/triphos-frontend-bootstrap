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
5. standalone 저장소면 `node ../../../scripts/finalize-init.mjs --target <directory>`로 `git init`과 initial commit을 수행한다. 상위 git 저장소가 있으면 skip한다.

## 누락 방지 게이트

- 스캐폴드 전에 이 SKILL.md의 `먼저 읽기` 파일을 전부 읽고, 템플릿/정책 계약을 기억한 뒤 실행한다.
- 템플릿 파일을 수동으로 부분 복사하지 않는다. 생성은 항상 `scaffold-app.mjs`를 통해 수행하고, 실패 시 실패 원인을 고친 뒤 재실행한다.
- 생성 후 대상 앱의 `package.json`에 `verify:frontend`, `verify:fsd`, `verify:react-rules`, `verify:api`, `verify:visual`, `verify:e2e`, `verify:uat`가 있는지 확인한다.
- 생성 후 `src/shared/api`, `src/shared/theme`, `src/entities/auth`, `src/entities/member`, `docs/`, `.codex/`, `.claude/`가 모두 존재하는지 확인한다.
- 누락된 파일이나 실패한 검증이 있으면 완료로 보고하지 말고, 누락 항목과 수정 계획을 먼저 처리한다.

## 템플릿 계약

- 이 스킬로 생성된 저장소가 강한 Triphos 하네스의 기본 대상이다.
- 생성 결과에는 `docs/` system-of-record, repo-local hooks, verifier scripts, browser harness scripts가 기본 포함된다.
- `src/shared/api/`와 `apiWithAdapter`가 기본 포함된다.
- `entities/auth`, token store, 최소 member store, auth-aware `api-bootstrap`이 기본 포함된다.
- query key는 `@lukemorales/query-key-factory`로 관리하고, entity `model/`에 `query-keys.ts`, `query-options.ts`, `mutation-options.ts`가 기본 포함된다.
- `.codex/hooks.json`, `.claude/settings.json`, verifier scripts가 기본 포함된다.
- standalone 저장소면 initial commit까지 자동화할 수 있고, 모노레포 하위 패키지는 상위 저장소를 사용하므로 nested git bootstrap은 하지 않는다.
- 더 깊은 entity API 추가나 raw API migration은 `triphos-api-client-setup`이 담당한다.
- 기존 프로젝트를 동일 baseline으로 올릴 때는 `triphos-frontend-adopt`를 사용한다.

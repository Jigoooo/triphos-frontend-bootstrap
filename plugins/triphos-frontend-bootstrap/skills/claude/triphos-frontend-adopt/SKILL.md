---
name: triphos-frontend-adopt
description: 기존 프론트엔드 프로젝트를 Triphos 템플릿 baseline에 강하게 정렬한다. repo-local hooks, verifier scripts, tsconfig/eslint, shared/api, auth/token/member baseline, api-bootstrap, AGENTS/CLAUDE를 audit 후 적용할 때 사용한다.
---

# triphos-frontend-adopt

기존 프로젝트를 `triphos-frontend-init` 결과와 같은 end-state로 끌어올리는 스킬이다.
자동 기본 경로가 아니라, 사용자가 기존 프로젝트를 Triphos 하네스로 명시적으로 올리고 싶을 때만 쓰는 opt-in migration surface다.

## 먼저 읽기

- [../../../references/shared/stack.md](../../../references/shared/stack.md)
- [../../../references/shared/init-contract.md](../../../references/shared/init-contract.md)
- [../../../references/shared/frontend-policy.md](../../../references/shared/frontend-policy.md)
- [../../../references/internal/frontend-doctor.md](../../../references/internal/frontend-doctor.md)

## 목표 상태

- `.codex/hooks.json`, `.claude/settings.json` 존재
- `docs/` system-of-record와 `docs/plans` 규약 존재
- `verify:frontend`, `verify:fsd`, `verify:react-rules`, `verify:api` 존재
- `src/shared/api/` + `apiWithAdapter` baseline 존재
- `@lukemorales/query-key-factory`와 entity `query-keys.ts`, `query-options.ts`, `mutation-options.ts` wrapper 존재
- `entities/auth`, token store, 최소 member store, auth-aware `api-bootstrap` 존재
- `triphos-fsd-refactor`, `triphos-react-lint-rules`, `eslint`, `typecheck`가 함께 강제 검증됨

## 단계

1. `audit`
   현재 프로젝트와 템플릿 baseline 차이를 리포트한다.
2. `align-runtime`
   `.codex/hooks.json`, `.claude/settings.json`, `AGENTS.md`, `CLAUDE.md`를 정렬한다.
3. `align-tooling`
   `package.json`, `tsconfig.json`, `eslint` 설정, verifier scripts를 정렬한다.
4. `align-api`
   `src/shared/api/`, `entities/auth`, `entities/member`, `api-bootstrap` baseline을 정렬한다.
   query-key-factory와 entity query/mutation wrapper도 함께 정렬한다.
5. `refactor`
   구조/API drift는 `triphos-fsd-refactor`, `triphos-api-client-setup`에 위임해 마이그레이션한다.

## 누락 방지 게이트

- `audit` 단계에서 목표 상태의 각 항목을 `present`, `missing`, `different`, `not-applicable` 중 하나로 분류한다.
- `different`와 `missing` 항목은 `apply`, `defer`, `pass` 중 하나로 처리 방침을 적는다. 처리 방침 없는 항목을 남긴 채 align 단계로 넘어가지 않는다.
- 템플릿 baseline을 수동 추측으로 만들지 말고, `templates/app/`와 관련 verifier script를 기준으로 비교한다.
- `align-api` 후에는 `pnpm verify:api`를, `align-tooling` 후에는 `pnpm verify:fsd`와 `pnpm verify:react-rules`를, 최종적으로 `pnpm verify:frontend`를 실행한다.
- 실패한 verifier가 있으면 실패 파일과 원인을 먼저 처리하고, 검증 생략을 완료로 보고하지 않는다.

## 원칙

- strong alignment가 기본값이다.
- 일반 프로젝트에 자동 전파하지 않는다. 이 스킬을 명시적으로 호출한 경우에만 같은 강제성을 적용한다.
- 무작정 덮어쓰지 말고 현재 구조와 baseline 차이를 먼저 설명한다.
- `scripts = 강제`, `hooks = 호출`, `docs = 정책`, `skills = 진단/수정` 경계를 유지한다.
- baseline 적용 후에는 `pnpm verify:frontend`를 반드시 통과시킨다.

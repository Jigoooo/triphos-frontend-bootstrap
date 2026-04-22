---
name: triphos-frontend-adopt
description: 기존 프론트엔드 프로젝트를 Triphos 템플릿 baseline에 강하게 정렬한다. repo-local hooks, verifier scripts, tsconfig/eslint, shared/api, auth/token/member baseline, api-bootstrap, AGENTS/CLAUDE를 audit 후 적용할 때 사용한다.
---

# triphos-frontend-adopt

기존 프로젝트를 `triphos-frontend-init` 결과와 같은 end-state로 끌어올리는 스킬이다.

## 목표 상태

- `.codex/hooks.json`, `.claude/settings.json` 존재
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

## 원칙

- strong alignment가 기본값이다.
- 무작정 덮어쓰지 말고 현재 구조와 baseline 차이를 먼저 설명한다.
- `scripts = 강제`, `hooks = 호출`, `docs = 정책`, `skills = 진단/수정` 경계를 유지한다.
- baseline 적용 후에는 `pnpm verify:frontend`를 반드시 통과시킨다.

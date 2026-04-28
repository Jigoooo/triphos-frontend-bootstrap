---
name: triphos-frontend-adopt
description: 기존 프론트엔드 프로젝트를 Triphos 템플릿 baseline에 강하게 정렬한다. repo-local hooks, verifier scripts, tsconfig/eslint, shared/api, auth/token/member baseline, api-bootstrap, AGENTS/CLAUDE를 audit 후 적용할 때 사용한다.
level: 3
triggers: ["frontend adopt", "triphos 마이그레이션", "baseline 정렬", "기존 프로젝트 adopt", "triphos 하네스 적용"]
pipeline: ["triphos-fsd-refactor", "triphos-api-client-setup"]
next-skill: triphos-fsd-refactor
handoff: inline
model: sonnet
---

# triphos-frontend-adopt

<Purpose>
기존 프론트엔드 프로젝트를 `triphos-frontend-init` 결과와 동일한 end-state로 끌어올리는 opt-in migration surface다. 사용자가 명시적으로 호출했을 때만 strong alignment를 적용한다.
</Purpose>

<Use_When>
- 기존 프로젝트를 Triphos baseline에 정렬하고 싶을 때
- 사용자가 "Triphos로 마이그레이션", "baseline 정렬", "adopt", "Triphos 하네스 적용"을 언급
- init 결과와 동일한 verifier/hooks/tooling을 기존 코드에 적용하려는 명시적 요청
</Use_When>

<Do_Not_Use_When>
- 새 프로젝트를 처음 시작할 때 → `triphos-frontend-init`
- 단일 entity API 추가/migration만 필요 → `triphos-api-client-setup`
- 사용자의 명시적 호출이 없을 때 — 일반 프로젝트에 자동 전파 금지
</Do_Not_Use_When>

<Why_This_Exists>
strong alignment가 default가 아니면 시간이 갈수록 verifier가 작동하지 않는 변종이 누적된다. adopt는 명시적 호출 시에만 같은 강제성을 적용해 baseline drift를 차단한다.
</Why_This_Exists>

<Inputs>
- 대상 프로젝트 디렉터리 (현재 working tree)
- 템플릿 variant — `package.json` deps에서 자동 감지 (`@tanstack/react-start`가 있으면 `app-ssr`, 없으면 `app`)
</Inputs>

<Read_First>
- [stack.md](../../../references/shared/stack.md) — 스택 / 패키지 매니저 baseline
- [init-contract.md](../../../references/shared/init-contract.md) — adopt 검증 계약
</Read_First>

분기 시점 lazy (`references/shared/`, `references/internal/` 아래):

- inline 스타일·className·shared/theme 정책 재확인 필요 시: `frontend-policy.md`
- 환경 진단/`doctor.mjs` 분기: `internal/frontend-doctor.md`

## 목표 상태

- `.codex/hooks.json`, `.claude/settings.json` 존재
- `docs/` system-of-record와 `docs/plans` 규약 존재
- `verify:frontend`, `verify:fsd`, `verify:react-rules`, `verify:api` 존재
- `src/shared/api/` + `apiWithAdapter` baseline 존재
- `@lukemorales/query-key-factory`와 entity `query-keys.ts`, `query-options.ts`, `mutation-options.ts` wrapper 존재
- `entities/auth`, token store, 최소 member store, auth-aware `api-bootstrap` 존재
- `triphos-fsd-refactor`, `triphos-react-lint-rules`, `eslint`, `typecheck`가 함께 강제 검증됨

<Steps>
1. **audit** — 현재 프로젝트와 템플릿 baseline 차이를 리포트한다.
2. **align-runtime** — `.codex/hooks.json`, `.claude/settings.json`, `AGENTS.md`, `CLAUDE.md`를 정렬한다. hook 파일과 settings는 plugin이 발행하는 `sync-hooks` 스크립트로 byte-equal 동기화한다 — 먼저 dry-run으로 차이를 점검하고, working tree가 깨끗할 때만 `--apply`로 덮어쓴다 (init 시점 snapshot이 stale해지는 P0 위험을 막는다):
   ```
   node <plugin-root>/scripts/sync-hooks.mjs --target . --variant <app|app-ssr>
   node <plugin-root>/scripts/sync-hooks.mjs --target . --variant <app|app-ssr> --apply
   ```
3. **align-tooling** — `package.json`, `tsconfig.json`, `eslint` 설정, verifier scripts를 정렬한다.
4. **align-api** — `src/shared/api/`, `entities/auth`, `entities/member`, `api-bootstrap` baseline을 정렬한다. query-key-factory와 entity query/mutation wrapper도 함께 정렬한다.
5. **refactor** — 구조/API drift는 `triphos-fsd-refactor`, `triphos-api-client-setup`에 위임해 마이그레이션한다.
</Steps>

<Tool_Usage>
- `sync-hooks.mjs` (dry-run → apply) — runtime 동기화 P0 보호.
- `pnpm verify:api` (align-api 후), `pnpm verify:fsd` / `pnpm verify:react-rules` (align-tooling 후), 최종 `pnpm verify:frontend`.
- `templates/app/`와 verifier script가 baseline의 진실 소스 — 수동 추측 금지.
</Tool_Usage>

<Escalation_And_Stop_Conditions>
- audit에서 목표 상태의 각 항목을 `present`/`missing`/`different`/`not-applicable` 중 하나로 분류해야 다음 단계로 넘어간다.
- `different`/`missing` 항목은 `apply`/`defer`/`pass` 중 하나로 처리 방침을 적는다. 처리 방침 없는 항목을 남긴 채 align 단계로 진행 금지.
- 실패한 verifier가 있으면 실패 파일과 원인을 먼저 처리한다 — 검증 생략을 완료로 보고하지 않는다.
- 사용자의 명시적 호출 없이 일반 프로젝트에 자동 전파하지 않는다.
</Escalation_And_Stop_Conditions>

<Final_Checklist>
- [ ] audit 결과의 모든 항목에 처리 방침 명시
- [ ] `sync-hooks` dry-run + apply 통과 (working tree clean 상태에서)
- [ ] `pnpm verify:api`, `pnpm verify:fsd`, `pnpm verify:react-rules` 통과
- [ ] `pnpm verify:frontend` 최종 통과
- [ ] `scripts = 강제`, `hooks = 호출`, `docs = 정책`, `skills = 진단/수정` 경계 유지
</Final_Checklist>

## 원칙

- strong alignment가 기본값이다.
- 일반 프로젝트에 자동 전파하지 않는다. 이 스킬을 명시적으로 호출한 경우에만 같은 강제성을 적용한다.
- 무작정 덮어쓰지 말고 현재 구조와 baseline 차이를 먼저 설명한다.
- `scripts = 강제`, `hooks = 호출`, `docs = 정책`, `skills = 진단/수정` 경계를 유지한다.
- baseline 적용 후에는 `pnpm verify:frontend`를 반드시 통과시킨다.

<Handoff>
- FSD 레이어 위반/슈퍼 컴포넌트/200줄 초과 파일 → `triphos-fsd-refactor`
- raw API migration, 새 entity API 추가 → `triphos-api-client-setup`
- 훅 lint/React Compiler 정리 → `triphos-react-lint-rules`
- 테마 토큰 추가/수정 → `triphos-theme-setup`
- SSR 베이스 + SEO/a11y 점검 → `triphos-seo-a11y-audit`
</Handoff>

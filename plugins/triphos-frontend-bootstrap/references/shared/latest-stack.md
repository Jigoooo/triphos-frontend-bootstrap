# Triphos Latest Stack Reference

This file captures the approved official reference set for the bootstrap.

## Stable defaults

- React 19 + React Compiler
- Vite 8
- TanStack Router / Query / Virtual
- Zustand
- Vitest 4
- `@jigoooo/api-client`
- `@lukemorales/query-key-factory`
- `framer-motion`
- `@floating-ui/react`
- TypeScript 6.0

## Official references

- React
  - `useEffectEvent`: https://react.dev/reference/react/useEffectEvent
  - `useOptimistic`: https://react.dev/reference/react/useOptimistic
  - `useActionState`: https://react.dev/reference/react/useActionState
- Vite 8:
  - https://vite.dev/blog/announcing-vite8
- Vitest 4 Browser Mode:
  - https://vitest.dev/blog/vitest-4
  - https://vitest.dev/guide/browser/
- MCP TypeScript SDK:
  - https://ts.sdk.modelcontextprotocol.io/
  - https://modelcontextprotocol.io/docs/sdk
- Claude Code MCP:
  - https://docs.anthropic.com/en/docs/claude-code/mcp
- TypeScript 6.0:
  - https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
  - `exactOptionalPropertyTypes`: https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html
  - `noUncheckedIndexedAccess`: https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html

## SSR baseline

- TanStack Start (SSR + Nitro Node) is the official SSR template since 0.7.0. Use `triphos-frontend-init --template app-ssr` for the SSR baseline; the SPA template (`--template app`, default) keeps client-only TanStack Router + Vite without Start/Nitro.
  - https://tanstack.com/start/v1
  - https://tanstack.com/blog/announcing-tanstack-start-v1

## Skill structure contract

플러그인의 모든 SKILL.md (`skills/claude/`, `skills/codex/` 양 surface)는 아래 골격을 따른다. `scripts/check-skill-parity.mjs`가 이 계약을 강제한다.

### Frontmatter

**필수 (parity가 모든 surface에서 검증)**

- `name`: kebab-case, 64자 이내, 디렉터리명과 동일
- `description`: 1024자 이내

**Surface-specific (parity가 strip 후 비교 — Claude만 의미 있음)**

- `model`: `haiku` | `sonnet` | `opus`
- `allowed-tools`: 도구 화이트리스트

**Surface-shared (양 surface byte-equal)**

- `argument-hint`: invocation hint string
- `level`: `1` (lookup/lint) | `2` (single-task) | `3` (multi-step) | `4` (orchestrated)
- `triggers`: flow-style 배열, 예: `["프론트엔드 init", "frontend init", "새 앱 생성"]`
- `pipeline`: 체인 스킬 배열 (source 스킬 한정), 예: `["triphos-frontend-init", "triphos-seo-a11y-audit"]`
- `next-skill`: 가장 빈번한 다음 스킬 이름 (source 스킬 한정)
- `next-skill-args`: next-skill 호출 인자 (선택)
- `handoff`: 산물 경로 또는 `inline` (선택)
- `effort`: `low` | `medium` | `high` (선택, level 보강용)

### Body XML 골격 (순서 강제)

1. `<Purpose>` — 1~2문장 정의
2. `<Use_When>` — 자동/수동 트리거 시나리오
3. `<Do_Not_Use_When>` — 다른 스킬로 위임해야 하는 케이스
4. `<Why_This_Exists>` — 존재 이유 / 어떤 누락·사고를 막는지
5. `<Inputs>` — 사용자 인자, 사전 조건
6. `<Read_First>` — 먼저 읽어야 하는 references 링크
7. `<Steps>` — 워크플로우 단계
8. `<Tool_Usage>` — 호출하는 스크립트/도구
9. `<Escalation_And_Stop_Conditions>` — 중단/에스컬레이션 조건
10. `<Final_Checklist>` — 완료 체크리스트
11. `<Handoff>` — 다음 스킬 분기 (source 스킬 필수, terminal 스킬 생략)

### Surface parity 정책 (옵션 A 채택, 2026-04-28)

- 두 surface는 byte-equal mirror — `model`, `allowed-tools`만 strip 후 비교
- Codex 전용 `<codex_skill_adapter>` 래퍼는 **사용 안 함** — Claude와 동일 XML 태그만 사용
- `triggers`, `pipeline`, `next-skill`, `next-skill-args`, `handoff`, `level`은 양 surface에서 동일 값

### 스킬 분류

- **Source (orchestrator)**: `triphos-frontend-init`, `triphos-frontend-adopt`, `triphos-fsd-refactor` — `<Handoff>`, `pipeline`, `next-skill` 모두 필수
- **Terminal (single-task)**: `triphos-react-lint-rules`, `triphos-theme-setup`, `triphos-seo-a11y-audit`, `triphos-api-client-setup` — `<Handoff>` 생략 가능

### Cross-reference / level 검증

- `next-skill`, `pipeline`에 등장한 스킬 이름은 `skills/{claude,codex}/<name>/SKILL.md`에 실재해야 함 — parity 스크립트가 검증
- orchestrator(`level: 3` 이상)는 `next-skill`로 자기보다 같거나 낮은 level 스킬을 가리키는 것이 정상 — 더 높은 level을 가리키면 parity 스크립트가 warning 발생

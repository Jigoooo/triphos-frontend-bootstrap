---
name: triphos-fsd-refactor
description: Feature-Sliced Design 리팩토링 — 진단·계획·실행·검증 6 phase로 레이어 위반·슈퍼 컴포넌트·200줄 초과·세그먼트 오분류를 정리한다.
argument-hint: "[file-or-directory]"
level: 3
effort: high
triggers: ["FSD 리팩토링", "fsd refactor", "FSD 위반", "레이어 정리", "슈퍼 컴포넌트 분리", "200줄 초과", "세그먼트 오분류"]
pipeline: ["triphos-react-lint-rules"]
next-skill: triphos-react-lint-rules
handoff: inline
allowed-tools: Read Edit Write Grep Glob Bash(git status) Bash(git diff *) Bash(git log *) Bash(git show *) Bash(pnpm check) Bash(pnpm lint *) Bash(pnpm tsc *) Bash(find *) Bash(ls *) Bash(node *)
model: sonnet
---

# triphos-fsd-refactor

<Purpose>
FSD 원칙에 따라 React/TypeScript 코드를 진단·리팩토링한다. 레이어 역류, Public API 우회, 슈퍼 컴포넌트/훅, 200줄 초과 파일, 세그먼트 오분류, widget 오분류를 잡아낸다.
</Purpose>

<Use_When>
- 사용자가 명시적으로 요청: "FSD로 리팩토링", "FSD 규칙 위반 찾아줘", `/triphos-fsd-refactor`
- 자동 발동: 프로젝트가 `src/{features,entities,pages,widgets,shared}` 구조이고 사용자가 파일 분리·훅 추출·"이 코드 어디에 두는 게 맞아?"·새 feature 구조 질문을 할 때
</Use_When>

<Do_Not_Use_When>
- 새 프로젝트 스캐폴드 → `triphos-frontend-init`
- 기존 프로젝트 baseline 정렬 → `triphos-frontend-adopt`
- 단일 entity API 추가/migration → `triphos-api-client-setup`
- 훅/컴파일러 lint 단독 정리 → `triphos-react-lint-rules`
</Do_Not_Use_When>

<Why_This_Exists>
FSD 위반은 변경 영향 예측 가능성을 깎는다. 레이어 역류, 슈퍼 컴포넌트, essence 기반 폴더는 시간이 지날수록 변경 비용을 폭발시킨다. 진단→계획→실행→검증 6 phase로 그 부채를 통제한다.
</Why_This_Exists>

<Language_Policy>
- 사용자에게 보이는 설명, 질문, 진행 상황, 오류 요약, 최종 보고는 사용자의 마지막 실질 요청 언어를 따른다.
- 한국어가 포함되었거나 언어 판단이 애매하면 한국어로 답한다.
- 기술 토큰(`SSR`, `SPA`, `app`, `app-ssr`, 명령어, 경로, 패키지명, API 이름, 코드 식별자)은 원문을 유지한다.
- 세부 기준은 [language-policy.md](../../../references/shared/language-policy.md)를 따른다.
</Language_Policy>

<Inputs>
- 단일 파일/폴더 리팩토링 대상 (선택)
- 또는 프로젝트 전체 진단 모드
- 또는 신규 코드 가이드 모드 ("이 새 feature 어디에 넣어야 해?")
</Inputs>

<Read_First>
- [workflow.md](../../../references/skill-bundles/triphos-fsd-refactor/workflow.md) — 각 phase 실행 매뉴얼 (audit 사용법, 12 priority scan, 완료 게이트, 계획 형식, 실행 원칙)
</Read_First>

Phase 진입 시점에 lazy 로딩 (workflow.md가 안내). 모두 `references/skill-bundles/triphos-fsd-refactor/` 아래에 있다:

- Phase 2 진입 시: `rules.md` 필독 — 진실 소스
- 세그먼트 분류 결정 시: `segments.md`
- import 방향·cross-import 판정 시: `layer-boundaries.md`
- 슈퍼 컴포넌트/훅 분리 패턴 필요 시: `anti-patterns.md`

## 사전 요구사항

- TanStack Query v5 (mutationOptions helper) / `@lukemorales/query-key-factory` / React 18+ / TypeScript
- FSD 레이어: `app`, `pages`, `widgets`, `features`, `entities`, `shared` (processes 사용 안 함)
- 결정 전 rules.md 필수 확인. 거기 없는 규칙은 만들어내지 말 것.

<Steps>
1. **Phase 1 — 입력 범위 파악**: 단일 파일·전체 진단·신규 코드 가이드 중 어느 모드인지 분류. 애매하면 한 번 묻는다.
2. **Phase 2 — 규칙 로딩**: rules.md 필독. 위 분기에 따라 보조 ref 추가 로딩.
3. **Phase 3 — 진단**: `scripts/audit-ui-components.mjs src` 실행 후 12 priority scan. 완료 게이트(audit + orchestration hook 강제 스캔 + 모든 후보 fix/defer/pass 분류) 통과 전 Phase 4 진입 금지.
4. **Phase 4 — 계획 제시**: 사용자 승인 전 코드 변경 금지. 영향 파일·예상 commit 수·각 후보 처리 방침을 포함. "진행"이면 실행, 수정 요청이면 계획 업데이트.
5. **Phase 5 — 실행**: 한 commit에 한 종류, layer 역류부터, import 경로 일괄 갱신, public API(`index.ts`) 갱신, `pnpm check` 통과, `triphos-react-lint-rules` 동시 적용, 이동만으로 완료 금지.
6. **Phase 6 — 검증**: audit 재실행 + `pnpm check` + 파일 크기 ≤ 200줄 + Public API import + 기능 동작 확인.

각 phase의 명령·출력 예시·완료 게이트 detail은 workflow.md 참조.
</Steps>

<Tool_Usage>
- 진실 소스: rules.md (+ 분기별 segments.md / layer-boundaries.md / anti-patterns.md)
- `scripts/audit-ui-components.mjs` — Phase 3.0 필수
- `pnpm check` — 타입체크 + lint + 빌드 (커밋 전 필수)
- `git mv` + grep으로 import 참조 추적 후 일괄 업데이트
- `triphos-react-lint-rules` 스킬 — 훅 추출/분리와 동시 적용
</Tool_Usage>

<Escalation_And_Stop_Conditions>
- Phase 3 완료 게이트 미충족 시 Phase 4 진입 금지.
- 사용자 승인 없이 리팩토링 코드 변경 금지.
- 이동만으로 완료 처리 금지 — 위치만 바꾸고 200줄/SRP 후보가 남으면 같은 commit에서 분리하거나 `defer` 리포트.
- 규칙이 이상하면 우선 rules.md "왜" 섹션 재독. 예외 반복 시 규칙 재검토 보고.

세부 escalation 정책은 workflow.md.
</Escalation_And_Stop_Conditions>

<Final_Checklist>
- [ ] rules.md 및 분기별 보조 ref 읽음
- [ ] `scripts/audit-ui-components.mjs` 실행 또는 동등 대체 스캔 완료
- [ ] Orchestration hook 강제 스캔 완료
- [ ] 모든 200줄 초과 / SRP 위반 / RETURN_OBJECT_HEAVY 후보가 `fix`/`defer`/`pass` 중 하나로 분류
- [ ] 사용자 승인된 리팩토링 계획 존재
- [ ] Layer 역류부터 commit 단위 정리, `pnpm check` 통과
- [ ] 훅 추출/분리에 `triphos-react-lint-rules` 동시 적용
- [ ] Phase 6 재검증(audit 재실행 + pnpm check + 파일 크기 + public API)
</Final_Checklist>

<Handoff>
- 훅 lint / React Compiler / useMemo·useCallback 제거 → `triphos-react-lint-rules` (Phase 5 동시 적용)
- commit 생성 시 → `commit` 스킬
- 타입/빌드 실패 → `ts-check` / `build-fix`
- raw API migration 동반 → `triphos-api-client-setup`
- baseline 부족 (verifier 없음) → `triphos-frontend-adopt`
</Handoff>

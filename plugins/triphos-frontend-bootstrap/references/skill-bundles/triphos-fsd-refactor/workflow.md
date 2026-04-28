# triphos-fsd-refactor — workflow detail

진단 → 계획 → 실행 → 검증 6 phase의 실행 매뉴얼. SKILL.md는 phase 골격만,
이 파일이 각 phase의 구체 detail을 담는다.

## Phase ↔ Reference 매핑

| Phase | 진실 소스 | 보조 |
|-------|-----------|------|
| 2 (규칙 로딩) | `rules.md` | — |
| 3 (진단) | `rules.md` | `segments.md`, `layer-boundaries.md`, `anti-patterns.md` |
| 4 (계획) | `anti-patterns.md` | `rules.md` |
| 5 (실행) | `anti-patterns.md` | `triphos-react-lint-rules` skill |

## Phase 3.0 — 자동 UI/hook audit (필수)

리팩토링/진단 모드에서는 수동 판단 전에 스킬 디렉터리의
`scripts/audit-ui-components.mjs`를 **반드시** 실행한다. 런타임이 스킬
디렉터리를 명확히 제공하면 그 경로에서 실행하고, 불명확하면 설치된
`triphos-fsd-refactor/scripts/audit-ui-components.mjs` 경로를 먼저 찾는다.

```bash
node <triphos-fsd-refactor-skill-dir>/scripts/audit-ui-components.mjs src
```

- 사용자가 특정 파일/디렉터리를 지정했으면 그 경로를 인자로 준다. 미지정 시
  `src` 스캔.
- 결과의 `LONG_FILE`, `SECTION_HINTS`, `JSX_CONDITIONALS`,
  `MULTIPLE_COMPONENTS`, `LOCAL_STATE_HEAVY`, `EFFECT_HEAVY`,
  `SERVER_STATE_IN_UI`, `ORCHESTRATION_HOOK_NAME`, `RETURN_OBJECT_HEAVY`,
  `HOOK_RESPONSIBILITY_HINTS` 후보를 진단 결과에 포함한다.
- 휴리스틱이라 false positive 가능 — 각 후보를 `fix` / `defer` / `pass` 중
  하나로 분류하고 이유를 적는다. 보고 없이 무시 금지.
- 스크립트 실행 실패 시 사유 기록 후, 동일 범위의 `.tsx/.jsx` 길이/조건부
  렌더/섹션 혼재와 hook 파일의 return 객체/책임 축을 수동으로 대체 스캔한다.
  실패를 이유로 audit 생략 금지.

## Phase 3 — 12 priority scan

변경 영향 크기 순:

1. **Layer 역류 import** — 가장 치명적. 하위 레이어가 상위 레이어를 import하면 즉시 리포트.
2. **api 세그먼트 위치 위반** — entities 외부의 `api/` 폴더 발견 시.
3. **Cross-slice import** — 같은 레이어의 다른 slice 직접 import. `@x`는 타입 전용인지 확인.
4. **Public API 우회** — `@/features/foo/ui/bar` 같은 내부 경로 직접 import.
5. **세그먼트 오분류** — hook이 잘못된 세그먼트에 있거나, essence 기반 폴더(`hooks/`, `types/`, `components/`) 존재.
6. **구성적 SRP 위반** — 줄 수와 무관. 한 컴포넌트가 **3개 이상의 독립 UI 섹션**(list, empty state, loading, filter bar, floating bar, banner 등)을 직접 렌더링하거나, 최상위 JSX에 조건부 렌더링(`? :`, `&&`)이 3개 이상 나열되면 분리 대상. 200줄 미만이어도 해당.
7. **파일 길이 초과** — 200줄 초과. 단, SRP 위반이 없는 단일 책임 파일(타입 정의, 설정 등)은 예외 가능.
8. **슈퍼 훅/함수** — return 객체 key 10개 이상, useState 5개 이상, 파라미터 5개 이상 등 메트릭 기반 위반.
   - **Orchestration hook 강제 스캔 (필수)**: Phase 3 진입 시 `src/pages/*/model/use-*-page.ts(x)`, `src/**/use-*-orchestration.ts(x)`, `src/**/use-*-manager.ts(x)` 패턴을 자동 글롭. 발견된 각 파일에 대해:
     - return 객체 key 수 카운트 (10개 초과 시 위반 확정)
     - 책임 축 분해 (fetch / 필터 상태 / UI 모드 / mutation / 인터랙션 분기 / 라우팅 등)
     - 책임 축 3개 이상이면 분해 리포트 **반드시** 생성
   - **완료 판정**: page 컴포넌트 섹션 분리만 수행하고 orchestration hook 스캔을 생략하면 Phase 3 미완료.
9. **재사용 안 되는 widget** — widget이 단일 page에서만 import됨.
10. **TanStack Query 패턴 위반** — features에 query key/mutation 직접 정의, entities api에 없음.
11. **네이밍 위반** — PascalCase 파일명, essence 기반 폴더.
12. **React 훅 패턴 위반** — `triphos-react-lint-rules` 스킬에 위임. 슈퍼 훅/컴포넌트 분해 과정에서 함께 스캔:
    - `useMemo` / `useCallback` (React Compiler 환경, 제거 대상. 예외: `useVirtualizer` 등)
    - `useEffect` 내 동기 `setState` → 렌더링 중 조건부 `setState`
    - `eslint-disable react-hooks/*` 흔적
    - 무거운 필터/검색 state 업데이트 → `useTransition` 후보
    - `useEffect` 내 deps 오염 → `useEffectEvent` 후보

## 진단 출력 예시

```
🔴 Critical (Layer 역류): 2건
  - src/shared/ui/button.tsx:12 → imports from @/features/add-medicine
  - src/entities/medicine/model/store.ts:5 → imports from @/features/delete-medicine

🟡 High (세그먼트 오분류): 3건
  - src/features/add-medicine/hooks/ → essence 기반 폴더, 분리 필요
  - src/features/add-medicine/model/use-dialog-open.ts → UI 상태 hook, ui/로 이동
  - src/entities/medicine/ui/add-medicine-form.tsx → 사용자 액션이므로 features로 이동

🟠 Medium (슈퍼 컴포넌트): 1건
  - src/pages/medicines/ui/medicines-page.tsx (487줄) → 섹션 분리 필요
```

## Phase 3 완료 게이트

다음이 모두 충족되기 전에는 Phase 4로 넘어가지 않는다:

- `audit-ui-components.mjs` 실행 결과 또는 실패 시 동등한 수동 대체 스캔이 진단에 포함됨.
- Orchestration hook 강제 스캔 결과가 포함됨.
- 200줄 초과 `.tsx` 파일이 전부 `fix` / `defer` / `pass` 중 하나로 분류됨.
- `SECTION_HINTS` 3개 이상 또는 `JSX_CONDITIONALS` 3개 이상 후보가 전부 분류됨.
- `ORCHESTRATION_HOOK_NAME`, `RETURN_OBJECT_HEAVY`, `HOOK_RESPONSIBILITY_HINTS` 후보가 전부 분류됨.
- `widgets` → `pages/app` demotion이나 page-local 이동을 했다면 이동된 파일을 다시 audit하고 “위치만 바꿨는지 / 책임도 줄였는지 / 후속 분리로 defer했는지” 명시.
- `defer`는 허용되지만 final report에 파일명, 이유, 후속 분리 방향을 반드시 남김.

## Phase 4 — 리팩토링 계획 형식

진단 직후 **코드를 바꾸지 마라**. 먼저 계획을 보여주고 사용자 승인을 받는다.

```
## 리팩토링 계획

### 1. Layer 역류 수정 (Critical)
- src/shared/ui/button.tsx
  - 현재: @/features/add-medicine의 useAddMedicine을 직접 호출
  - 변경: Button은 onClick prop을 받고, 호출부(feature)에서 useAddMedicine을 사용
  - 영향 파일: button.tsx, 호출하는 feature 3곳

### 2. 세그먼트 오분류 수정
...

## 영향받는 파일: 12개
## 예상 commit 수: 4개 (역류 수정 / 세그먼트 이동 / 컴포넌트 분리 / import 정리)
```

자동 UI audit 후보의 처리 방침("이번 범위에서 고침" / "defer" / "pass") 도
계획에 반드시 포함. 분류 없는 긴 UI 파일은 계획 누락이다.

사용자가 "진행"이라고 하면 실행, 수정 요청이 있으면 계획 업데이트.

## Phase 5 — 실행 원칙

1. **한 번에 한 commit씩**. 여러 종류의 변경을 섞지 마라.
2. **Layer 역류부터** 고친다. 역류를 남긴 채 다른 걸 고치면 중간 상태가 깨진다.
3. **파일 이동 시 import 경로 전부 업데이트**. `grep`으로 참조 확인 후 이동.
4. **Public API(`index.ts`) 업데이트 잊지 말기**.
5. **`pnpm check`로 검증** (타입체크 + lint + 빌드). 커밋 전 반드시 통과.
6. **커밋 메시지는 한국어**, 프로젝트 컨벤션 따름.
7. **훅 추출/컴포넌트 분리 시 `triphos-react-lint-rules` 동시 적용**. 슈퍼 훅을 쪼갤 때 useMemo/useCallback 제거, useEffect 내 setState 패턴 교정, React 19 훅(`useTransition`, `useEffectEvent`) 도입 판단을 함께. 별개 commit으로 미루지 말 것.
8. **이동만으로 완료 처리 금지**. widget/page-local demotion으로 위치만 바꾼 뒤 200줄 초과 또는 SRP 후보가 남으면 같은 commit에서 분리하거나 명시적 `defer` 리포트.

## Phase 6 — 검증

- `audit-ui-components.mjs` 재실행 결과와 Phase 3 후보 처리 상태 확인
- `pnpm check` 통과 확인
- 리팩토링된 파일 크기 확인 (200줄 이내 목표)
- Public API 경로로 import가 되는지 확인
- 기능이 여전히 동작하는지 (UI 변경이면 브라우저에서 확인 권장)

## 신규 코드 가이드 모드

사용자가 "이 새 feature 어디에 넣어야 해?"라고 물으면 리팩토링이 아닌
**가이드 모드**로 동작한다:

1. 무엇을 만들려는지 파악 (사용자 액션 / 도메인 개념 / 재사용 블록 / 유틸 / 설정)
2. `rules.md`의 레이어 정의에 비추어 **레이어 결정**
3. 그 안에서 **슬라이스 이름** 제안
4. 필요한 **세그먼트**만 만들고, essence 기반 폴더(`hooks/`, `types/`, `components/`) 피하기
5. TanStack Query 관련이면 entities/api에 query key + queryOptions + mutationOptions 먼저 만들고, features/model에서 조립하는 스켈레톤 제시

코드를 만들기 전에 이 배치안을 먼저 사용자에게 확인받는다.

## Escalation & Stop Conditions

- Phase 3 완료 게이트(audit 실행 + orchestration hook 스캔 + 모든 후보 분류) 미충족 시 Phase 4 진입 금지.
- 사용자 승인 없이 리팩토링 코드 변경 금지.
- 규칙이 이상하게 느껴지면 **우선** `rules.md`의 "왜" 섹션 재독. 정당한 예외면 사용자에게 명시적으로 설명하고 동의 받기. 예외 반복 시 규칙 자체 재검토 보고. 말없이 어기지 말 것.
- 이동만으로 완료 처리 금지 — 위치만 바꾸고 200줄/구성적 SRP 후보가 남으면 같은 commit에서 분리하거나 `defer` 리포트.

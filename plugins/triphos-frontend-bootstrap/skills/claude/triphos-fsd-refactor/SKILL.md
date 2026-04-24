---
name: triphos-fsd-refactor
description: FSD(Feature-Sliced Design) 리팩토링 - 세그먼트 오분류, 레이어 경계 위반, Public API 우회, 슈퍼 컴포넌트/훅, 200줄 초과 파일, 잘못 분류된 widget 진단/수정. src/{features,entities,pages,widgets,shared} 구조 프로젝트에서 파일 분리, 레이어 이동, 훅 추출 요청 시 자동 발동.
argument-hint: [file-or-directory]
effort: high
allowed-tools: Read Edit Write Grep Glob Bash(git status) Bash(git diff *) Bash(git log *) Bash(git show *) Bash(pnpm check) Bash(pnpm lint *) Bash(pnpm tsc *) Bash(find *) Bash(ls *) Bash(node *)
---

# triphos-fsd-refactor

Feature-Sliced Design 원칙에 따라 React/TypeScript 코드베이스를 진단하고 리팩토링하는 스킬.

## 언제 쓰는가

### 사용자가 명시적으로 요청할 때
- "FSD로 리팩토링해줘"
- "이 파일 FSD 원칙에 맞게 정리"
- "FSD 규칙 위반 찾아줘"
- "/triphos-fsd-refactor"

### 자동으로 발동해야 할 때 (사용자가 FSD를 언급하지 않아도)
프로젝트가 `src/{features,entities,pages,widgets,shared}` 구조를 가지고 있고, 사용자가 다음을 요청하면:
- 파일/폴더 구조 정리
- 컴포넌트 분리, 훅 추출
- 리팩토링 (특히 긴 파일을 쪼갤 때)
- "이 코드 어디에 두는 게 맞아?"
- 새 feature/entity 추가 시 구조 질문

## 사전 요구사항

이 스킬은 다음 전제를 가정한다:

- TanStack Query v5 (mutationOptions helper 사용)
- `@lukemorales/query-key-factory`로 query key 관리
- React 18+ / TypeScript
- FSD 레이어: `app`, `pages`, `widgets`, `features`, `entities`, `shared` (processes 사용 안 함)

규칙의 세부는 `references/rules.md`가 진실 소스다. 리팩토링 결정을 내리기 전에 **반드시 이 파일을 먼저 읽어라**.

## 워크플로우

### Phase 1 — 입력 범위 파악

사용자의 요청이 다음 중 어느 것인지 먼저 판단한다:

1. **단일 파일/폴더 리팩토링**: "이 파일을 FSD에 맞게 정리"
2. **프로젝트 전체 진단**: "전체 FSD 위반 찾아줘"
3. **신규 코드 가이드**: "이 새 feature 어디에 넣어야 해?"

각 모드는 워크플로우가 다르다. 사용자가 애매하면 한 번 물어라.

### Phase 2 — 규칙 로딩

**항상** `references/rules.md`를 먼저 읽는다. 이 파일은 프로젝트의 FSD 철학과 공식 FSD 위에 얹은 의식적 결정(예: "api 세그먼트는 entities에만")을 담고 있다. 여기 없는 규칙은 만들어내지 마라.

세부 판정이 필요한 경우 다음을 추가로 읽는다:
- 세그먼트 분류 결정이 필요하면 → `references/segments.md`
- Import 방향/cross-import 판정이 필요하면 → `references/layer-boundaries.md`
- 리팩토링 패턴(슈퍼 컴포넌트 분리 등)이 필요하면 → `references/anti-patterns.md`

### Phase 3 — 진단 (Detection)

#### Phase 3.0 — 자동 UI/hook audit (필수)

리팩토링/진단 모드에서는 수동 판단 전에 이 스킬 디렉터리 기준 `scripts/audit-ui-components.mjs`를 **반드시** 실행한다. 런타임이 스킬 디렉터리를 명확히 제공하면 그 경로에서 실행하고, 불명확하면 설치된 `triphos-fsd-refactor/scripts/audit-ui-components.mjs` 경로를 먼저 찾은 뒤 실행한다.

```bash
node <triphos-fsd-refactor-skill-dir>/scripts/audit-ui-components.mjs src
```

- 사용자가 특정 파일/디렉터리를 지정했으면 그 경로를 인자로 준다. 지정이 없으면 `src`를 스캔한다.
- 결과의 `LONG_FILE`, `SECTION_HINTS`, `JSX_CONDITIONALS`, `MULTIPLE_COMPONENTS`, `LOCAL_STATE_HEAVY`, `EFFECT_HEAVY`, `SERVER_STATE_IN_UI`, `ORCHESTRATION_HOOK_NAME`, `RETURN_OBJECT_HEAVY`, `HOOK_RESPONSIBILITY_HINTS` 후보를 Phase 3 진단 결과에 포함한다.
- 스크립트는 휴리스틱 도구다. false positive는 가능하지만 **보고 없이 무시하면 안 된다**. 각 후보는 `fix`, `defer`, `pass` 중 하나로 분류하고 이유를 적는다.
- 스크립트 실행이 실패하면 실패 사유를 기록하고, 동일 범위의 `.tsx/.jsx` 파일 길이/조건부 렌더/섹션 혼재와 `.ts/.tsx` hook 파일의 return 객체/책임 축을 수동으로 대체 스캔한다. 실패를 이유로 audit을 생략하지 않는다.

대상 코드를 다음 우선순위로 스캔한다. 이 순서는 변경 영향 크기 순이다:

1. **Layer 역류 import** — 가장 치명적. 하위 레이어가 상위 레이어를 import하면 즉시 리포트.
2. **api 세그먼트 위치 위반** — entities 외부의 `api/` 폴더 발견 시.
3. **Cross-slice import** — 같은 레이어의 다른 slice 직접 import. `@x`는 타입 전용인지 확인.
4. **Public API 우회** — `@/features/foo/ui/bar` 같은 내부 경로 직접 import.
5. **세그먼트 오분류** — hook이 잘못된 세그먼트에 있거나, essence 기반 폴더(`hooks/`, `types/`, `components/`) 존재.
6. **구성적 SRP 위반** — 줄 수와 무관. 한 컴포넌트가 **3개 이상의 독립 UI 섹션**(list, empty state, loading, filter bar, floating bar, banner 등)을 직접 렌더링하거나, 최상위 JSX에 조건부 렌더링(`? :`, `&&`)이 3개 이상 나열되면 분리 대상. 200줄 미만이어도 해당.
7. **파일 길이 초과** — 200줄 초과 파일. 단, 구성적 SRP 위반이 없는 단일 책임 파일(타입 정의, 설정 등)은 예외 가능.
8. **슈퍼 훅/함수** — return 객체 key 10개 이상, useState 5개 이상, 파라미터 5개 이상 등 메트릭 기반 위반.
   - **Orchestration hook 강제 스캔 (필수)**: Phase 3 진입 시 `src/pages/*/model/use-*-page.ts(x)`, `src/**/use-*-orchestration.ts(x)`, `src/**/use-*-manager.ts(x)` 패턴을 **자동 글롭**한다. 발견된 각 파일에 대해:
     - return 객체 key 수 카운트 (10개 초과 시 위반 확정)
     - 책임 축 분해 (fetch / 필터 상태 / UI 모드 / mutation / 인터랙션 분기 / 라우팅 등)
     - 책임 축 3개 이상이면 분해 리포트 **반드시** 생성
   - **완료 판정**: page 컴포넌트 섹션 분리(§7.2 B)만 수행하고 orchestration hook 스캔을 생략하면 Phase 3 미완료. 둘 다 스캔해야 Phase 4 진행 가능.
9. **재사용 안 되는 widget** — widget이 단일 page에서만 import됨.
10. **TanStack Query 패턴 위반** — features에 query key/mutation 직접 정의, entities api에 없음.
11. **네이밍 위반** — PascalCase 파일명, essence 기반 폴더.
12. **React 훅 패턴 위반** — 슈퍼 훅/컴포넌트를 분해하는 과정에서 다음도 함께 스캔한다. 세부 규칙은 `triphos-react-lint-rules` 스킬 참조:
    - `useMemo` / `useCallback` (React Compiler 환경이므로 제거 대상, 예외: `useVirtualizer` 등)
    - `useEffect` 내 동기 `setState` → 렌더링 중 조건부 `setState`로 전환
    - `eslint-disable react-hooks/*` 흔적
    - 무거운 필터/검색 state 업데이트 → `useTransition` 적용 후보
    - `useEffect` 내 deps 오염 → `useEffectEvent`로 분리 후보

진단 결과는 사용자에게 **구체적으로** 보여줘라:

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

#### Phase 3 완료 게이트

다음이 모두 충족되기 전에는 Phase 4로 넘어가지 않는다:

- `scripts/audit-ui-components.mjs` 실행 결과 또는 실패 시 동등한 수동 대체 스캔이 진단에 포함됨.
- Orchestration hook 강제 스캔 결과가 포함됨.
- 200줄 초과 `.tsx` 파일이 전부 `fix`, `defer`, `pass` 중 하나로 분류됨.
- `SECTION_HINTS` 3개 이상 또는 `JSX_CONDITIONALS` 3개 이상 후보가 전부 `fix`, `defer`, `pass` 중 하나로 분류됨.
- `ORCHESTRATION_HOOK_NAME`, `RETURN_OBJECT_HEAVY`, `HOOK_RESPONSIBILITY_HINTS` 후보가 전부 `fix`, `defer`, `pass` 중 하나로 분류됨.
- `widgets` → `pages/app` demotion, page-local 이동, 파일 rename/move를 했다면 이동된 파일을 다시 audit하고 “위치만 바꿨는지 / 책임도 줄였는지 / 후속 분리로 defer했는지”를 명시함.
- `defer`는 허용되지만 final report에 파일명, 이유, 후속 분리 방향을 반드시 남김.

### Phase 4 — 리팩토링 계획 제시

진단 직후 **코드를 바꾸지 마라**. 먼저 계획을 보여주고 사용자 승인을 받아야 한다.

계획은 다음 형식으로:

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

계획에는 자동 UI audit 후보의 처리 방침도 반드시 포함한다. “이번 범위에서 고침”, “명확한 이유로 defer”, “false positive로 pass” 중 하나가 없는 긴 UI 파일은 계획 누락이다.

사용자가 "진행"이라고 하면 실행, 수정 요청이 있으면 계획 업데이트.

### Phase 5 — 실행 (Execution)

리팩토링을 진행할 때 지키는 원칙:

1. **한 번에 한 commit씩**. 여러 종류의 변경을 한 commit에 섞지 마라.
2. **Layer 역류부터** 고친다. 역류를 남긴 채 다른 걸 고치면 중간 상태가 깨진다.
3. **파일 이동 시 import 경로 전부 업데이트**. `grep`으로 참조 확인 후 이동.
4. **Public API(`index.ts`) 업데이트 잊지 말기**. 새 export가 생기면 `index.ts`에 추가.
5. **pnpm check로 검증** (프로젝트의 타입체크 + lint + 빌드). 커밋 전 반드시 통과.
6. **커밋 메시지는 한국어**, 프로젝트 컨벤션 따름.
7. **훅 추출/컴포넌트 분리 시 `triphos-react-lint-rules` 동시 적용**. 슈퍼 훅을 쪼갤 때 useMemo/useCallback 제거, useEffect 내 setState 패턴 교정, React 19 최신 훅(`useTransition`, `useEffectEvent`) 도입 판단을 함께 수행한다. 분리 후에 별개 commit으로 미루지 말고 같은 맥락에서 정리한다.
8. **이동만으로 완료 처리 금지**. widget/page-local demotion으로 파일 위치만 바꾼 뒤 200줄 초과 또는 구성적 SRP 후보가 남으면 같은 commit에서 분리하거나, 명시적으로 `defer` 리포트를 남긴다.

### Phase 6 — 검증

변경 후:
- `scripts/audit-ui-components.mjs` 재실행 결과와 Phase 3 후보 처리 상태 확인
- `pnpm check` 통과 확인
- 리팩토링된 파일 크기 확인 (200줄 이내 목표)
- Public API 경로로 import가 되는지 확인
- 기능이 여전히 동작하는지 (UI 변경이면 브라우저에서 확인 권장)

## 신규 코드 가이드 모드

사용자가 "이 새 feature 어디에 넣어야 해?"라고 물으면 리팩토링이 아닌 **가이드 모드**로 동작한다:

1. 무엇을 만들려는지 파악 (사용자 액션 / 도메인 개념 / 재사용 블록 / 유틸 / 설정)
2. `references/rules.md`의 레이어 정의에 비추어 **레이어 결정**
3. 그 안에서 **슬라이스 이름** 제안
4. 필요한 **세그먼트**만 만들고, essence 기반 폴더 피하기
5. TanStack Query 관련이면 entities/api에 query key + queryOptions + mutationOptions 먼저 만들고, features/model에서 조립하는 스켈레톤 제시

코드를 만들기 전에 이 배치안을 먼저 사용자에게 확인받아라.

## 규칙을 어기고 싶을 때

규칙이 이상하게 느껴지는 순간이 있을 것이다. 이때:

1. **우선 `references/rules.md`의 "왜" 섹션을 다시 읽는다.** 대부분의 규칙은 변경 영향 예측 가능성을 위해 존재한다.
2. **그래도 예외가 정당하면**, 사용자에게 명시적으로 설명하라: "이 케이스는 규칙 X에 어긋나지만, 이유 Y 때문에 예외로 두려 합니다. 동의하시나요?"
3. **예외가 반복되면** 규칙이 잘못된 것이다. 사용자에게 "이 규칙이 자주 어긋납니다. `triphos-fsd-skill-update`로 규칙 자체를 재검토하시겠어요?" 제안.

규칙을 말없이 어기지 마라. 어겼다면 왜 어겼는지 리포트하라.

## 다른 스킬과의 관계

- **`triphos-fsd-skill-update`**: 규칙 자체를 공식 FSD docs와 동기화. 리팩토링 중에 "이 규칙 최신인가?"가 궁금하면 사용자에게 `/fsd-skill-update` 실행을 제안. 자동 호출하지 마라.
- **`triphos-react-lint-rules`**: React 19 + React Compiler 환경의 훅 규칙(useMemo/useCallback 제거, useEffect 내 setState 교정, useTransition/useEffectEvent 도입). 슈퍼 훅/컴포넌트를 분해하거나(Phase 3 항목 8·6), 훅을 추출할 때(Phase 5 원칙 7) **동일 세션에서 함께 참조**한다. FSD로 레이어·세그먼트를 정리하면서 훅 내부 패턴은 이 스킬로 교정 — 두 작업을 분리 commit으로 미루지 않는다.
- **`commit`**: 리팩토링 commit 생성 시 이 스킬 사용.
- **`ts-check`** / **`build-fix`**: 리팩토링 후 타입/빌드 실패 시 이들로 후처리.

## 참고 파일

- `references/rules.md` — 진실 소스. 모든 리팩토링 결정의 기준.
- `references/segments.md` — 세그먼트 분류 결정표. "이 파일은 어디에?" 질문 해결용.
- `references/layer-boundaries.md` — import 방향과 cross-import 규칙.
- `references/anti-patterns.md` — 슈퍼 컴포넌트/훅/함수 분리 전략 카탈로그.

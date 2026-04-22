# FSD Rules (프로젝트 규칙)

> 이 문서는 `fsd-refactor` 스킬의 진실 소스(source of truth)다.
> `fsd-skill-update` 스킬은 이 문서를 Context7로 가져온 최신 FSD 공식 docs와 비교해 드리프트를 리포트한다.
> 여기 적힌 규칙은 공식 FSD 위에 얹은 **이 프로젝트의 의식적 선택**이므로, 공식과 달라도 이유가 있다면 유지한다.

## 목차

- [왜 이 규칙이 있는가](#왜-이-규칙이-있는가-철학)
- [1. 레이어 (Layers)](#1-레이어-layers) — import 방향, 각 레이어 책임
- [2. 세그먼트 (Segments)](#2-세그먼트-segments) — model/lib/config/ui/api 정의
- [3. TanStack Query + query-key-factory 패턴](#3-tanstack-query--query-key-factory-패턴-핵심) — entities/api 조립 방식
  - [3.4 HTTP 클라이언트 — @jigoooo/api-client](#34-http-클라이언트--jigoooo/api-client--apiwithadapter) (api-client-setup 스킬 참조)
- [4. Widgets 판정 기준](#4-widgets-판정-기준)
- [5. Pages 레이어에서의 분리 규칙](#5-pages-레이어에서의-분리-규칙)
- [6. Public API (`index.ts`)](#6-public-api-indexts) — cross-import + `@x` notation
- [7. 프로젝트 품질 규칙 (FSD 위의 layer)](#7-프로젝트-품질-규칙-fsd-위의-layer) — 200줄, SRP, 네이밍
- [8. 리팩토링 우선순위](#8-리팩토링-우선순위) — 위반 발견 시 고치는 순서

## 왜 이 규칙이 있는가 (철학)

Feature-Sliced Design의 목적은 **변경 영향 범위를 예측 가능하게 만드는 것**이다. 레이어/슬라이스/세그먼트는 "이 코드가 무엇을 알아도 되는가"를 구조적으로 강제한다. 아래 규칙은 그 철학을 TanStack Query + React 환경에 맞춰 구체화한 것이다. 규칙을 만나면 "공식이라서"가 아니라 "왜 이게 변경 영향을 줄이는가"를 먼저 이해하라.

---

## 1. 레이어 (Layers)

사용 레이어: `app`, `pages`, `widgets`, `features`, `entities`, `shared`
(`processes`는 deprecated. 사용 금지.)

### 1.1 Import 방향 — 엄격 준수

```
app → pages → widgets → features → entities → shared
```

- 위 레이어는 아래 레이어만 import 가능.
- 아래 레이어는 위 레이어를 절대 import할 수 없음.
- 같은 레이어 간 cross-import도 원칙적으로 금지 (§ 6 참고).

**왜**: 이 방향이 깨지면 "shared를 고쳤는데 왜 features가 깨지지?" 같은 역류 장애가 생긴다. 변경 영향을 위에서 아래로만 흐르게 하는 게 전체 원칙의 기반이다.

### 1.2 각 레이어의 책임

- **app**: 전역 provider, 라우터 진입, 전역 스타일, 앱 초기화. 슬라이스 없음 (세그먼트로 바로 나뉨).
  - **Expo Router 예외**: Expo Router 프로젝트에서는 `src/app/` (또는 루트 `app/`)이 **파일 기반 라우트 디렉토리**로 예약돼 있다. 이 경우 FSD의 app 레이어 코드(providers, 초기화 등)를 `src/app/` 안에 둘 수 없다. 대신:
    - `src/providers/` — 전역 provider 모음(QueryClient, Dialog, Modal, Toast, AppInit 등). FSD의 app 레이어 역할을 대리.
    - Import 방향 규칙상 **providers는 app 레이어와 동급**으로 취급 (최상위). pages/widgets/features/entities/shared가 providers를 import하면 역류.
    - `src/app/`은 라우트 파일만 담는다 (Expo Router 규칙).
  - 즉, Expo Router 프로젝트에서 `src/providers/`를 발견하면 **비표준 위반이 아니다**. 라우팅 프레임워크 제약으로 인한 정당한 분리.
- **pages**: 라우트 한 개당 슬라이스 한 개. features/entities/widgets를 **조립(compose)**하는 역할.
- **widgets**: 여러 page에서 **재사용되는** 큰 UI 블록만. 한 페이지 안의 큰 블록은 widget이 아니라 pages 내부에서 분리한다 (§ 4 참고).
- **features**: 사용자 관점의 상호작용 단위. "약 추가", "약 삭제", "로그인"처럼 실제 가치(value)를 만드는 동작.
- **entities**: 비즈니스 개념. "User", "Medicine", "Article" 같은 실세계 명사. 데이터 계약(API, query key, queryOptions, mutationOptions, 타입)을 소유.
- **shared**: 비즈니스 무지(business-agnostic). UI 키트, 유틸, 타입 가드, http 클라이언트, 디자인 토큰. 슬라이스 없음 (세그먼트로 바로 나뉨).

---

## 2. 세그먼트 (Segments)

### 2.1 모든 레이어(slice)에 허용되는 세그먼트

`model`, `lib`, `config`, `ui`

### 2.2 `api` 세그먼트는 entities에만 (+ shared)

- `entities/*/api/` — 비즈니스 개념 단위로 API 계약을 소유. 여기에 query key, queryOptions, mutationOptions가 전부 모인다.
- `shared/api/` — 도메인 무지 http 클라이언트, 인터셉터, 공통 fetcher.
- `features/*/api/`, `widgets/*/api/`, `pages/*/api/` — **금지**.

**왜**: API 호출 방법은 "어떤 엔티티의 데이터인가"로 분류돼야 중복이 제거된다. feature마다 api/를 만들면 동일 엔티티의 query key가 여러 feature에 흩어져 invalidation 지옥이 생긴다. feature는 entities의 api를 **조립**만 한다.

> ℹ️ 공식 FSD 문서는 `features/*/api/`도 허용하지만, 이 프로젝트는 TanStack Query + query-key-factory 패턴을 위해 의식적으로 더 엄격하게 간다.

### 2.3 각 세그먼트의 정의

#### `ui`
- React 컴포넌트, 스타일(`styles.ts` 등), 컴포넌트 옆 뷰 전용 hook.
- "UI가 사라지면 같이 사라져도 되는 코드"는 여기 또는 컴포넌트 파일 안.
- 네이밍 예: `medicine-card.tsx`, `use-medicine-card-state.ts`, `styles.ts`.

#### `model`
- **비즈니스 로직 + 상태.** 공식 정의: "data model: schemas, interfaces, stores, business logic."
- 이 세그먼트에 들어가는 것:
  - Zustand/Jotai/Redux 스토어
  - 타입/인터페이스/zod 스키마
  - 비즈니스 로직 hook (`useAddMedicine`, `useMedicineForm` 등 — 서버 상태나 도메인 결정을 다룸)
  - 데이터용 Context provider (사용자 정보, 권한 등)
- **들어가면 안 되는 것**: `hooks/`, `types/`, `stores/` 같은 essence 기반 하위 폴더. 공식 안티패턴.

#### `lib`
- **Slice 내부에서 쓰는 보조 코드.** "library code that other modules on this slice need."
- 포함 가능: formatter, parser, validator, 도메인 무관 유틸 hook (`useDebounce` 등), 타입 가드, 계산 함수.
- "순수 함수"만은 아님 — slice 내부의 helper 성격 코드 전반.
- **들어가면 안 되는 것**: 비즈니스 결정 로직 (그건 `model`).

#### `config`
- 상수, 설정, feature flag, enum, 테이블 컬럼 정의, 상태 라벨 맵 등 **변하지 않는 구성값**.
- 포함 가능: `medicine-status.ts` (상태 상수 + 라벨), `form-field-config.ts`, feature flag.

#### `api` (entities/shared에서만)
- 아래 구조를 지향:
  ```
  entities/medicine/api/
  ├── medicine-api.ts              # raw fetch 함수
  ├── medicine-query-keys.ts       # @lukemorales/query-key-factory로 key + queryFn 한 번에
  ├── medicine-mutations.ts        # TanStack Query v5 mutationOptions 래퍼
  └── index.ts
  ```

---

## 3. TanStack Query + query-key-factory 패턴 (핵심)

이 프로젝트는 TanStack Query 호출 로직을 다음과 같이 분리한다.

### 3.1 entities/api — 계약 소유

```ts
// entities/medicine/api/medicine-query-keys.ts
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { medicineApi } from './medicine-api';

export const medicineKeys = createQueryKeys('medicine', {
  list: (filters: MedicineFilters) => ({
    queryKey: [{ filters }],
    queryFn: () => medicineApi.getList(filters),
  }),
  detail: (id: string) => ({
    queryKey: [id],
    queryFn: () => medicineApi.getDetail(id),
  }),
});
```

```ts
// entities/medicine/api/medicine-mutations.ts
import { mutationOptions } from '@tanstack/react-query';
import { medicineApi } from './medicine-api';

export const addMedicineMutationOptions = () =>
  mutationOptions({
    mutationKey: ['medicine', 'add'],
    mutationFn: medicineApi.add,
  });

export const deleteMedicineMutationOptions = () =>
  mutationOptions({
    mutationKey: ['medicine', 'delete'],
    mutationFn: medicineApi.delete,
  });
```

### 3.2 features/model — 조립 + 부수효과

feature는 entities의 queryOptions/mutationOptions를 가져다가 `useQuery`/`useMutation`에 넣고, 그 위에 UI 부수효과(dialog, toast, invalidation)를 얹는다.

```ts
// features/add-medicine/model/use-add-medicine.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMedicineMutationOptions, medicineKeys } from '@/entities/medicine';
import { useDialog } from '@/shared/ui';

export const useAddMedicine = () => {
  const qc = useQueryClient();
  const dialog = useDialog();

  return useMutation({
    ...addMedicineMutationOptions(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: medicineKeys.list._def });
      dialog.open({ type: 'success', message: '약이 추가되었습니다.' });
    },
    onError: () => {
      dialog.open({ type: 'error', message: '추가에 실패했습니다.' });
    },
  });
};
```

### 3.3 features/ui — 순수 호출

ui 컴포넌트는 hook만 쓴다. 여기에 `useMutation`, `useQueryClient`, `queryKey` 같은 TanStack API를 직접 호출하지 않는다.

```tsx
// features/add-medicine/ui/add-medicine-form.tsx
import { useAddMedicine } from '../model/use-add-medicine';

export const AddMedicineForm = () => {
  const { mutate, isPending } = useAddMedicine();
  // ...
};
```

**왜 이 분리인가**:
- queryKey가 한 곳(entities)에만 존재 → invalidation 일관성
- feature hook이 테스트 가능한 단위 → mock이 쉬움
- UI는 "hook을 호출하는 것"만 알면 됨 → 변경 격리

### 3.4 HTTP 클라이언트 — `@jigoooo/api-client` + `apiWithAdapter`

이 프로젝트는 entities/api의 raw fetch 함수를 `@jigoooo/api-client`의 `api` 객체로 호출하고 `apiWithAdapter`로 감싸 정규화된 응답을 반환한다. 예:

```ts
// entities/medicine/api/medicine-api.ts
import { api } from '@jigoooo/api-client';
import { apiWithAdapter } from '@/shared/api';

export const addMedicineApi = (data: AddMedicineRequest) =>
  apiWithAdapter<Medicine>(api.post('/medicines', data));
```

`shared/api/` baseline의 셋업과 새 entity의 api 파일 추가는 **`api-client-setup` 스킬**이 담당한다. `fsd-refactor`는 entities/api 파일이 이 패턴을 따르는지 **검증만** 하고, 위반을 발견하면 **직접 수정하지 말고** 사용자에게 `/api-client-setup migrate <path>` 실행을 제안한다.

검증 체크리스트 (fsd-refactor가 확인할 것):
- `entities/*/api/*.ts` 파일이 `import { api } from '@jigoooo/api-client'`를 사용하는가?
- 각 함수가 `apiWithAdapter<T>(api.method(...))` 형태인가?
- raw `fetch()` 또는 `axios.xxx` 직접 호출이 섞여 있지 않은가?
- 함수 이름이 `<verb><Entity>Api` 네이밍 규칙을 따르는가?

위반을 발견하면 리포트에 포함하되 수정은 `api-client-setup`에 위임.

### 3.5 Query Key / Query Options / Mutation Options

이 프로젝트는 entity `model/`에서 TanStack Query wrapper를 관리한다.

- query key는 `@lukemorales/query-key-factory`로 정의한다.
- `queryOptions` wrapper는 entity `model/query-options.ts`에 둔다.
- `mutationOptions` wrapper는 entity `model/mutation-options.ts`에 둔다.
- feature는 entity wrapper를 `useQuery`, `useMutation`에 직접 넣어 사용한다.

예:

```ts
const query = useQuery(memberQueryOptions.me());
const mutation = useMutation(memberMutationOptions.updateMe(queryClient));
```

검증 체크리스트:
- entity `model/query-keys.ts`가 `createQueryKeys`를 사용하는가?
- entity `model/query-options.ts`가 `queryOptions`를 사용하는가?
- entity `model/mutation-options.ts`가 `mutationOptions`를 사용하는가?
- feature에서 query key나 mutationFn을 다시 inline 정의하지 않는가?

---

## 4. Widgets 판정 기준

widget으로 만들려면 **아래 조건을 모두** 만족해야 한다:

1. 둘 이상의 page에서 **실제로 import**되고 있다.
2. 여러 features/entities를 조합한 **자족적(self-sufficient) UI 블록**이다.
3. 자체 데이터 fetching/loading/error 상태를 가진다.

**Expo Router 예외 — Tabs/Stack layout shell 컴포넌트**: Expo Router의 `_layout.tsx`에서 `tabBar` prop 등으로 주입되는 네비게이션 shell(예: `CustomTabBar`)은 import 사이트가 1개(해당 `_layout.tsx`)여도 widget으로 둘 수 있다. 이유: layout이 감싸는 모든 탭/스택 라우트가 런타임에 이 shell을 간접 공유하므로 "여러 페이지에서 재사용" 조건을 실질적으로 만족한다. `src/app/` 직접 배치는 Expo Router 라우팅 규약(모든 파일이 라우트로 인식됨) 때문에 불가하고, `shared/ui`는 비즈니스 무지 조건을 위반(탭 구조 지식을 가짐)하므로 widgets가 가장 적합.

**한 페이지 안에서만 쓰이는 큰 블록은 widget이 아니다.** 그 경우:
- 그 페이지 내부에서 컴포넌트 파일만 분리한다 (`pages/medicines/ui/medicine-list-section.tsx`).
- 또는 `pages/medicines/ui/`에 디렉토리를 만들어 섹션 단위로 쪼갠다.

**왜**: widgets 레이어가 "큰 컴포넌트 창고"가 되면 재사용성이 없는 덩어리가 쌓여 리팩토링 대상이 늘어난다. 재사용이 실제로 생긴 시점에만 승격한다.

---

## 5. Pages 레이어에서의 분리 규칙

page에서만 쓰는 hook/함수/타입/상수는 해당 page 슬라이스 내부(`pages/xxx/model`, `pages/xxx/lib`, `pages/xxx/config`)에 둔다. **다른 곳에서도 쓰이게 되는 순간 아래 레이어로 내린다.**

예:
- `pages/medicines/model/use-medicines-page.ts` — 이 페이지에서만 쓰는 orchestration hook. 다른 page가 쓰기 시작하면 → `features/medicine-list/model/`로 이동 또는 `entities/medicine`에서 추출.
- `pages/medicines/config/page-columns.ts` — 이 페이지의 테이블 컬럼 정의.

**왜**: 재사용 전에 섣불리 아래 레이어로 보내면 premature abstraction이 되고, 재사용이 생겼는데 page에 남겨두면 cross-page import가 생긴다. "실제 재사용이 발생할 때" 이동이 트리거다.

---

## 6. Public API (`index.ts`)

- 모든 slice는 `index.ts`로 외부 공개 API를 노출.
- 외부에서는 `@/features/add-medicine`처럼 slice 루트만 import. 내부 경로 직접 import는 금지.
- 예외: type 재노출을 위한 `@x` notation (§ 6.1).

```ts
// features/add-medicine/index.ts
export { AddMedicineForm } from './ui/add-medicine-form';
export { useAddMedicine } from './model/use-add-medicine';
```

### 6.1 Cross-import — `@x`는 타입 전용

같은 레이어 slice 간 cross-import는 금지. 예외적으로 entities 간 타입 참조가 자연스러운 경우에만 `@x` notation 허용.

```ts
// entities/prescription/@x/medicine.ts — prescription이 medicine에게 주는 타입 전용 공개 API
export type { Prescription } from '../model/types';
```

**규칙**: `@x`로는 **`export type`만** 허용. 런타임 값(함수/컴포넌트/상수)을 `@x`로 공유하면 순환 참조 + "두 entity가 사실상 하나" 신호이므로 **slice 합병 또는 shared로 내림**을 검토하라.

---

## 7. 프로젝트 품질 규칙 (FSD 위의 layer)

이건 공식 FSD와 무관한 **이 프로젝트의 품질 기준**이다.

### 7.1 파일 길이: 200줄 이내
- 한 파일 200줄 초과 시 분리 대상. SRP 관점에서 재분할.
- 예외: 자동 생성 파일, 설정/상수 모음, 타입 정의 모음.

### 7.2 슈퍼 컴포넌트/훅/함수 금지 — SRP
- 하나의 컴포넌트/hook/함수는 **한 가지 책임**만.
- 조짐 (아래 중 **하나라도** 해당하면 SRP 위반 후보):

  **A. 메트릭 기반 (정량)**
  - 파일 이름에 `and`, `helper`, `manager`, `handler`가 붙는다
  - `useEffect`가 5개 이상이다
  - props가 10개 이상이다
  - **(훅 전용)** return 객체 key가 10개 이상이다
  - **(훅 전용)** 내부 `useState`가 5개 이상이다
  - **(훅 전용) Orchestration hook naming 자동 플래그**: 파일명이 `use-*-page.ts`, `use-*-orchestration.ts`, `use-*-manager.ts` 패턴이면 **반드시** return key 카운트 + 책임 축 분해 수행. 이 naming 자체가 "페이지의 모든 상태를 한 hook에 모음" 안티패턴(anti-patterns §2) 신호임.

  **B. 구성적 SRP (정성) — 200줄 미만이어도 위반**
  - 한 컴포넌트가 **3개 이상의 독립 UI 섹션**을 직접 렌더링한다
    - 독립 UI 섹션이란: list, empty state, loading skeleton, filter/tab bar, floating action bar, banner/alert, dialog/modal 등 **별개의 관심사를 가진 렌더 블록**
    - 예: list + empty state + tab filter + delete mode banner + floating bar = 5개 섹션 → 분리 대상
  - 최상위 JSX에 **삼항 연산자(`? :`) 또는 `&&` 조건부 렌더링이 3개 이상** 중첩/나열된다
  - `if` 분기에 따라 완전히 다른 렌더링을 한다
  - "이 컴포넌트가 뭘 하는가?"를 **한 문장으로 설명할 수 없다**

- **핵심 원칙**: 줄 수는 보조 지표일 뿐이다. 150줄 파일이라도 list + empty + loading + filter를 한 곳에서 다루면 SRP 위반이다. 반대로 250줄이라도 단일 책임이면 예외다.

- 분리 방법:
  - UI 섹션 분리 → 같은 slice 내 서브 컴포넌트 추출 (예: `medicines-list-section.tsx`, `medicines-empty.tsx`)
  - 상태 분기 → 커스텀 hook 분리
  - 로직 분기 → 순수 함수 추출 (`lib/`)
  - 페이지 컴포넌트 → composition 패턴 (메인 컴포넌트는 조립만, 각 섹션은 별도 파일)

### 7.3 네이밍
- 파일: `kebab-case.tsx`
- 컴포넌트/타입: `PascalCase`
- 훅: `useXxx`
- 세그먼트 하위 폴더 만들 때 essence 기반 이름(`hooks/`, `types/`, `components/`) **금지**. 목적 기반 이름만 허용 (`form/`, `validation/` 등).

---

## 8. 리팩토링 우선순위

`fsd-refactor` 스킬이 위반을 발견했을 때 고치는 순서:

1. **Layer import 방향 위반** (§ 1.1) — 가장 위험, 즉시 수정
2. **api 세그먼트 위치 위반** (§ 2.2) — entities 외부의 api/ 폴더 발견 시
3. **세그먼트 오분류** (§ 2.3) — hook이 잘못된 세그먼트에 있거나 essence 기반 폴더 존재
4. **Public API 위반** (§ 6) — 내부 경로 직접 import
5. **구성적 SRP 위반** (§ 7.2 B) — 줄 수와 무관. 독립 UI 섹션 3개 이상 혼재, 조건부 렌더 블록 3개 이상
6. **200줄 초과 / 슈퍼 훅·함수** (§ 7.1, 7.2 A) — 메트릭 기반 SRP 위반
7. **Widget 오분류** (§ 4) — 재사용 안 되는 widget을 page로 내림
8. **네이밍 위반** (§ 7.3)

---

## 변경 이력

이 문서가 수정되면 `fsd-skill-update` 스킬이 최신 FSD 공식 docs와 대조해 드리프트 리포트를 생성한다. 규칙을 의식적으로 공식과 다르게 유지하는 부분은 "왜" 섹션에 이유가 기록돼 있어야 한다.

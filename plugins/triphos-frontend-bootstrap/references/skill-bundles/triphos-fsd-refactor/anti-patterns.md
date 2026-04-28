# Anti-patterns — 발견하면 리팩토링해야 할 코드 냄새

> 이 문서는 `fsd-refactor` 스킬이 리팩토링 기회를 발견할 때 사용하는 패턴 카탈로그다.
> 각 안티패턴은 **증상(어떻게 발견하는가)** → **왜 나쁜가** → **분리 전략**의 순서로 기술한다.

## 목차

1. [슈퍼 컴포넌트](#1-슈퍼-컴포넌트) — 한 파일에 여러 책임
2. [슈퍼 훅](#2-슈퍼-훅) — 한 hook에 여러 책임
3. [슈퍼 함수](#3-슈퍼-함수) — 한 함수에 여러 책임
4. [Essence 기반 네이밍](#4-essence-기반-네이밍) — `hooks/`, `types/`, `components/` 폴더
5. [잘못된 세그먼트 배치](#5-잘못된-세그먼트-배치) — hook이 lib에, 컴포넌트가 model에
6. [Cross-slice import](#6-cross-slice-import) — 같은 레이어 slice 간 직접 import
7. [Public API 우회](#7-public-api-우회) — slice 내부 경로 직접 접근
8. [Layer 역류](#8-layer-역류) — 하위 레이어가 상위 레이어 import
9. [재사용 안 되는 widget](#9-재사용-안-되는-widget) — 단일 page에서만 쓰는 widget
10. [Mutation을 feature/api에 두는 것](#10-mutation을-featureapi에-두는-것-이-프로젝트-고유) — 프로젝트 고유 규칙
- [리팩토링 판정 체크리스트](#리팩토링-판정-체크리스트)

## 1. 슈퍼 컴포넌트

### 증상

**A. 메트릭 기반 (정량적)**
- 한 파일이 200줄을 초과
- `useState` / `useRef`가 7개 이상
- `useEffect`가 3개 이상
- props가 10개 이상 (children 제외)
- 파일 이름에 `And`, `Manager`, `Handler`, `Wrapper` 등 복합 책임을 암시하는 단어

**B. 구성적 SRP (정성적) — 줄 수와 무관하게 위반**
- 한 컴포넌트가 **3개 이상의 독립 UI 섹션**을 직접 렌더링
  - 독립 UI 섹션 예: list, empty state, loading skeleton, filter/tab bar, floating action bar, banner/alert, dialog/modal, header action
- 최상위 JSX에 **삼항(`? :`) 또는 `&&` 조건부 렌더링이 3개 이상** 중첩/나열
- "이 컴포넌트가 뭘 하는가?"를 한 문장으로 답할 수 없음

> **판정 기준**: A 또는 B 중 하나라도 해당하면 슈퍼 컴포넌트다. 150줄이라도 B에 해당하면 분리 대상이다.

### 왜 나쁜가
읽을 때 "이 컴포넌트가 뭘 하는 거지?"를 한 문장으로 답할 수 없다. 변경 영향 범위를 예측할 수 없고, 테스트가 불가능에 가까워진다. React Compiler/메모이제이션 효과도 떨어진다. 줄 수가 적어도 관심사가 혼재하면 한 섹션을 고칠 때 다른 섹션이 영향받는 구조적 문제가 동일하게 발생한다.

### 분리 전략

**전략 A — UI 섹션 추출 (Composition)**
```tsx
// Before: 500줄 MedicinesPage
export const MedicinesPage = () => {
  // 필터 상태, 리스트 fetch, 삭제 모드, 다이얼로그 모두 여기서
};

// After
export const MedicinesPage = () => {
  return (
    <>
      <MedicinesHeader />
      <MedicinesFilterBar />
      <MedicinesList />
      <MedicinesDeleteDialog />
    </>
  );
};
```
각 섹션을 같은 slice 내부에서 컴포넌트로 추출. hook으로 상태를 끌어올리거나 각자 소유하게 한다.

**전략 B — 로직을 hook으로 분리 (Container/Presenter)**
```tsx
// Before
export const AddMedicineForm = () => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const { mutate } = useMutation({ /* ... */ });
  // 100줄 로직 + 100줄 JSX
};

// After
// features/add-medicine/model/use-add-medicine-form.ts
export const useAddMedicineForm = () => {
  // 모든 상태와 핸들러
};

// features/add-medicine/ui/add-medicine-form.tsx
export const AddMedicineForm = () => {
  const form = useAddMedicineForm();
  return <form onSubmit={form.handleSubmit}>{/* JSX만 */}</form>;
};
```

**전략 C — 분기별 컴포넌트 분리**
```tsx
// Before
export const MedicineCard = ({ variant, ...props }) => {
  if (variant === 'compact') return <>...</>;
  if (variant === 'full') return <>...</>;
  if (variant === 'selectable') return <>...</>;
};

// After — 완전히 다른 렌더를 하면 별개 컴포넌트
export const CompactMedicineCard = (props) => <>...</>;
export const FullMedicineCard = (props) => <>...</>;
export const SelectableMedicineCard = (props) => <>...</>;
```

---

## 2. 슈퍼 훅

### 증상
- hook이 `use[Feature]Everything` 느낌
- 하나의 hook에서 fetch, mutation, 로컬 상태, 라우팅, 다이얼로그를 모두 다룸
- return 객체의 key가 10개 이상
- 내부에 `useState` 5개 이상

### 왜 나쁜가
hook이 재사용 단위라는 의미가 사라진다. 소비자가 hook의 일부 기능만 쓰고 싶어도 전체를 받아야 한다. 테스트 시 모든 의존성을 mock해야 한다.

### 분리 전략

**책임 축 별로 쪼개기**
```ts
// Before
const useMedicinesPage = () => {
  // 1) 목록 fetch
  // 2) 필터 상태
  // 3) 삭제 mutation
  // 4) 삭제 모드 토글
  // 5) 페이지네이션
  // → 5개 책임
};

// After
const useMedicinesList = () => { /* fetch + 필터 */ };
const useDeleteMode = () => { /* 삭제 모드 UI 상태 */ };
const useDeleteMedicine = () => { /* mutation + 부수효과 */ };
const usePagination = () => { /* 페이지 상태 */ };

// 페이지에서 조립
const MedicinesPage = () => {
  const list = useMedicinesList();
  const deleteMode = useDeleteMode();
  const del = useDeleteMedicine();
  // ...
};
```

**조립 책임은 page에 남긴다.** `useMedicinesPage`처럼 "이 페이지의 모든 상태"를 한 곳에 모으는 hook은 피하라. page는 컴포넌트 레벨에서 자식 hook들을 조립해야 한다.

---

## 3. 슈퍼 함수

### 증상
- 함수 하나가 50줄 초과
- 파라미터가 5개 이상
- `if/else` 중첩 3단계 이상
- `switch`의 case 수가 10개 이상
- 함수 이름에 `process`, `handle`, `do`, `execute`가 들어감

### 왜 나쁜가
단위 테스트를 작성하기 어렵고, 디버깅 시 어디서 실패했는지 추적이 힘들다. "이 함수가 뭘 하는가"를 한 문장으로 답할 수 없으면 SRP 위반이다.

### 분리 전략
- 단계별 helper 함수로 쪼갬
- 조건 분기마다 전용 함수 추출
- pure validation / transform / side-effect를 분리

---

## 4. Essence 기반 네이밍

### 증상
Slice 내부에 이런 폴더가 있음:
```
features/add-medicine/
├── hooks/            ❌
├── types/            ❌
├── components/       ❌
├── utils/            ❌
└── constants/        ❌
```

또는 세그먼트 안에 `hooks.ts`, `types.ts`처럼 essence로 묶인 덩어리 파일.

### 왜 나쁜가
"훅이니까 hooks/에 있어야지"는 **무엇인가**(essence)로 분류하는 것이다. FSD는 **왜 여기 있는가**(purpose)로 분류한다. 공식 FSD는 이를 명시적 안티패턴으로 지정했다.

### 수정
- `hooks/use-form.ts` → `model/use-form.ts` (비즈니스 로직이면)
- `hooks/use-dialog-open.ts` → `ui/use-dialog-open.ts` (뷰 상태면)
- `types/index.ts` → 사용처 옆에 co-locate
- `components/modal.tsx` → `ui/modal.tsx`
- `utils/format-date.ts` → `lib/format-date.ts`

---

## 5. 잘못된 세그먼트 배치

### 증상 & 수정

| 발견한 위치 | 실제로 있어야 할 곳 | 판단 기준 |
|---|---|---|
| `features/xxx/api/` | `entities/*/api/` | 이 프로젝트는 feature api 금지 |
| `features/xxx/model/store.ts` (전역 스토어) | `shared/` 또는 `entities/*/model/` | 전역 상태는 entity 개념으로 |
| `shared/ui/medicine-card.tsx` | `entities/medicine/ui/` | shared는 비즈니스 무지 |
| `entities/medicine/ui/add-medicine-form.tsx` | `features/add-medicine/ui/` | 사용자 액션이면 feature |
| `widgets/medicine-list.tsx` (한 페이지만 사용) | `pages/medicines/ui/` | 재사용 없는 widget 금지 |
| `shared/lib/medicine-api.ts` | `entities/medicine/api/` | 도메인 있으면 shared 아님 |

---

## 6. Cross-slice import

### 증상
```ts
// features/add-medicine/model/use-add-medicine.ts
import { deleteMedicine } from '@/features/delete-medicine';  // ❌
```

```ts
// entities/prescription/model/types.ts
import { Medicine } from '@/entities/medicine';  // ❌ 런타임 의존
```

### 수정
- **두 feature를 함께 쓰고 싶다면**: 상위 page/widget에서 조립
- **두 entity가 타입 참조**: `@x` notation 사용 (타입 전용)
- **두 entity가 런타임 의존**: 합치거나 shared로 내림

---

## 7. Public API 우회

### 증상
```ts
// ❌
import { AddMedicineForm } from '@/features/add-medicine/ui/add-medicine-form';
import { useAddMedicine } from '@/features/add-medicine/model/use-add-medicine';
```

### 수정
1. `features/add-medicine/index.ts`에서 필요한 것만 export
2. 소비자는 `@/features/add-medicine`에서만 import

```ts
// features/add-medicine/index.ts
export { AddMedicineForm } from './ui/add-medicine-form';
export { useAddMedicine } from './model/use-add-medicine';
```

---

## 8. Layer 역류

### 증상
```ts
// shared/ui/button.tsx
import { useAddMedicine } from '@/features/add-medicine';  // ❌ shared가 features를 앎
```

```ts
// entities/medicine/model/use-medicines.ts
import { useDialog } from '@/features/dialog';  // ❌ entities가 features를 앎
```

### 수정
역류는 거의 항상 **잘못된 코드 이동**의 결과다. 해결:
- 이 의존성이 정말 필요하면 → 아래 레이어로 내려가야 할 코드가 위에 있는 것. 내린다.
- 이 의존성이 feature/widget 고유 로직이면 → shared/entities에 있으면 안 되는 코드. 위로 올린다.

---

## 9. 재사용 안 되는 widget

### 증상
`widgets/foo-widget/`이 딱 한 page에서만 import됨.

### 확인
```bash
# widget 사용처 검색
grep -r "from '@/widgets/foo-widget'" src/
```

### 수정
그 widget을 해당 page 내부로 이동:
```
widgets/foo-widget/  →  pages/xxx/ui/foo-section.tsx
```

**재사용이 생기는 순간** 다시 widgets로 승격한다. "언젠가 재사용될 것 같아서" widgets에 미리 두지 마라.

---

## 10. Mutation을 feature/api에 두는 것 (이 프로젝트 고유)

### 증상
```
features/add-medicine/api/add-medicine.ts  ❌
```

### 왜 나쁜가
이 프로젝트는 **entities/api에 mutationOptions**를 두는 것으로 정했다. feature가 mutation 함수를 직접 소유하면 여러 feature가 같은 mutation을 중복 정의하는 일이 생긴다.

### 수정
```ts
// entities/medicine/api/medicine-mutations.ts
import { mutationOptions } from '@tanstack/react-query';
import { medicineApi } from './medicine-api';

export const addMedicineMutationOptions = () =>
  mutationOptions({
    mutationKey: ['medicine', 'add'],
    mutationFn: medicineApi.add,
  });
```

```ts
// features/add-medicine/model/use-add-medicine.ts
import { addMedicineMutationOptions } from '@/entities/medicine';

export const useAddMedicine = () => {
  return useMutation({
    ...addMedicineMutationOptions(),
    onSuccess: () => { /* dialog, invalidation */ },
  });
};
```

---

## 리팩토링 판정 체크리스트

리팩토링 기회를 체계적으로 찾을 때 이 순서로 스캔:

1. **Layer 역류** 있는가? (`grep`로 하위 레이어에서 상위 레이어 import 탐색)
2. **Cross-slice import** 있는가?
3. **Public API 우회** 있는가? (slice 내부 경로 직접 import)
4. **`api/` 세그먼트**가 entities 외부에 있는가?
5. **Essence 기반 폴더**(`hooks/`, `types/`, `components/`)가 있는가?
6. **구성적 SRP 위반** 있는가? (줄 수와 무관 — 독립 UI 섹션 3개 이상 혼재, 조건부 렌더 블록 3개 이상)
7. **200줄 초과** 파일이 있는가?
8. **슈퍼 훅/함수** 증상 있는가? (return key 10개 이상, useState 5개 이상, 파라미터 5개 이상)
   - **Naming 자동 트리거**: 파일명이 `use-*-page.ts(x)`, `use-*-orchestration.ts(x)`, `use-*-manager.ts(x)` 패턴이면 **자동 슈퍼 훅 후보**. 해당 naming은 "페이지의 모든 상태를 한 hook에 모음" 안티패턴(§2) 신호이므로 메트릭 미충족이어도 책임 축 분해 수행 후 판정.
9. **잘못 분류된 세그먼트** 있는가? (hook이 lib에, 컴포넌트가 model에 등)
10. **재사용 안 되는 widget** 있는가?
11. **네이밍 위반** 있는가?

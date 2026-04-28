# Layer Boundaries — Import 방향과 Cross-slice

> 레이어 경계는 FSD의 가장 중요한 제약이다. 이게 깨지면 "shared를 바꿨는데 왜 features가 깨지지?" 같은 예측 불가 장애가 발생한다. 이 문서는 모든 허용/금지 import 패턴의 구체적 예시를 제공한다.

## 단방향 dependency 원칙

```
┌─────────┐
│   app   │  최상위: 모두 import 가능
└────┬────┘
     ↓
┌─────────┐
│  pages  │  pages/widgets/features/entities/shared import 가능
└────┬────┘
     ↓
┌─────────┐
│ widgets │  widgets/features/entities/shared import 가능
└────┬────┘
     ↓
┌─────────┐
│features │  features/entities/shared import 가능*
└────┬────┘
     ↓
┌─────────┐
│entities │  entities/shared import 가능*
└────┬────┘
     ↓
┌─────────┐
│ shared  │  shared만 import 가능 (비즈니스 무지)
└─────────┘
```

\* 같은 레이어 간 cross-import는 원칙적으로 금지 (아래 참고).

---

## 허용되는 import 패턴 (✅)

### 상위 레이어 → 하위 레이어

```ts
// pages/medicines/ui/medicines-page.tsx
import { AddMedicineForm } from '@/features/add-medicine';      // ✅ pages → features
import { MedicineCard } from '@/entities/medicine';              // ✅ pages → entities
import { Button } from '@/shared/ui';                            // ✅ pages → shared
```

```ts
// features/add-medicine/model/use-add-medicine.ts
import { addMedicineMutationOptions, medicineKeys } from '@/entities/medicine'; // ✅ features → entities
import { useDialog } from '@/shared/ui';                                         // ✅ features → shared
```

```ts
// entities/medicine/api/medicine-api.ts
import { apiClient } from '@/shared/api';                        // ✅ entities → shared
```

### 같은 slice 내부 import

```ts
// features/add-medicine/ui/add-medicine-form.tsx
import { useAddMedicine } from '../model/use-add-medicine';     // ✅ slice 내부는 자유
import { validateDosage } from '../lib/validate-dosage';         // ✅
```

**규칙**: slice 내부에서는 상대 경로(`../`) 사용 가능. 다른 slice는 절대 경로(`@/`) + `index.ts` 경유.

---

## 금지되는 import 패턴 (❌)

### 1. 역방향 import

```ts
// ❌ shared/ui/button.tsx
import { useAddMedicine } from '@/features/add-medicine';  // shared가 features를 알면 안 됨
```

```ts
// ❌ entities/medicine/model/use-medicine.ts
import { useDialog } from '@/features/dialog';             // entities가 features를 알면 안 됨
```

**왜 안 되는가**: shared와 entities는 "범용 인프라/도메인 개념"이어야 한다. 이들이 특정 feature를 알면 그 feature 없이는 재사용할 수 없고, feature 삭제 시 entities까지 영향을 받는다.

### 2. 같은 레이어 내 cross-import

```ts
// ❌ features/add-medicine/model/use-add-medicine.ts
import { deleteMedicine } from '@/features/delete-medicine';  // feature 간 cross-import 금지
```

```ts
// ❌ entities/prescription/model/use-prescription.ts
import { Medicine } from '@/entities/medicine';               // 런타임 값은 금지 (타입도 @x 경유)
```

**대안**:
- **features 간 조립이 필요하면**: 상위 레이어(page 또는 widget)에서 두 feature를 함께 쓴다.
  ```tsx
  // pages/medicines/ui/medicines-page.tsx
  import { AddMedicineForm } from '@/features/add-medicine';
  import { MedicineList } from '@/features/medicine-list';
  // 두 feature를 조합
  ```
- **entities 간 타입 참조가 필요하면**: `@x` notation 사용 (타입 전용).

### 3. 내부 경로 직접 import (public API 우회)

```ts
// ❌ pages/medicines/ui/medicines-page.tsx
import { AddMedicineForm } from '@/features/add-medicine/ui/add-medicine-form';  // slice 내부 직접 접근
```

```ts
// ✅ 올바른 형태
import { AddMedicineForm } from '@/features/add-medicine';  // index.ts 경유
```

**왜**: public API (`index.ts`)가 slice의 계약(contract)이다. 외부 소비자는 계약에만 의존해야 내부 구조를 리팩토링할 때 외부가 깨지지 않는다.

---

## Cross-import: `@x` notation (타입 전용)

entities 간에 자연스러운 참조가 필요한 경우에만 제한적으로 허용.

### 구조

```
entities/
├── medicine/
│   ├── model/
│   │   └── types.ts       # export type Medicine
│   ├── @x/
│   │   └── prescription.ts   # prescription에게 주는 타입 공개 API
│   └── index.ts
└── prescription/
    ├── model/
    │   └── types.ts       # import { Medicine } from 'entities/medicine/@x/prescription'
    └── index.ts
```

### 코드

```ts
// entities/medicine/@x/prescription.ts — medicine이 prescription에게 주는 타입
export type { Medicine } from '../model/types';
```

```ts
// entities/prescription/model/types.ts
import type { Medicine } from '@/entities/medicine/@x/prescription';

export interface Prescription {
  id: string;
  medicines: Medicine[];
}
```

### 엄격한 제약

1. **`export type`만 허용.** 런타임 값(함수/컴포넌트/상수) export 금지.
2. **entities 레이어에서만 사용 권장.** features/widgets에서 `@x`가 필요하면 설계 재검토.
3. **방향성에 주의.** A가 B를 참조하고 B가 A를 참조하는 양방향 `@x`는 "두 entity가 사실상 하나"라는 강력한 신호. slice 합병 검토.
4. **런타임 의존이 필요하면 slice를 합치거나 shared로 내린다.** `@x`로 함수를 공유하는 건 안 된다.

---

## 레이어 없는 규칙: `app`, `shared`

`app`과 `shared`는 slice가 없고 세그먼트로 바로 나뉜다.

```
app/
├── providers/
├── router/
├── styles/
└── index.tsx

shared/
├── ui/
├── api/
├── lib/
└── config/
```

- `shared/*`는 **비즈니스 무지**여야 한다. "Medicine"을 알면 안 된다. "Button"은 알아도 된다.
- `app/*`는 모든 레이어를 import할 수 있지만, 다른 어느 것도 `app`을 import할 수 없다.

---

## 판정 체크리스트

파일 import를 검토할 때 이 순서로 확인:

1. 이 import는 **아래 방향**인가?
2. `index.ts` 경유인가, 아니면 내부 경로 직접 접근인가?
3. 같은 레이어의 다른 slice를 import하는가? (금지)
4. `@x` 사용 시 `export type`만 쓰고 있는가?
5. shared가 비즈니스 개념을 알고 있지는 않은가?

이 중 하나라도 걸리면 리팩토링 대상이다.

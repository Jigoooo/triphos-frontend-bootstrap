# Segment 분류 결정표

> 세그먼트 오분류가 이 프로젝트에서 가장 흔한 FSD 위반이다. 이 문서는 "이 코드는 어디에 두어야 하는가"를 빠르게 결정하기 위한 참조표다.
> 원칙은 `rules.md`를, 여기는 구체적인 판정 테이블을 참고하라.

## 핵심 질문 순서

어떤 파일을 어느 세그먼트에 둘지 고민된다면 **이 순서대로** 물어봐라:

1. **서버 상태를 다루는가?** → 거의 확실히 `entities/*/api` 또는 `features/*/model`
2. **비즈니스 결정을 내리는가?** (조건 분기, 도메인 규칙, workflow orchestration) → `model`
3. **순수 계산/변환인가?** (도메인 무관, 입력→출력) → `lib`
4. **변하지 않는 구성값인가?** (상수, enum, 설정) → `config`
5. **픽셀이 보이는가? UI 상태만 다루는가?** → `ui`

---

## 파일 종류별 배치표

| 파일 종류 | 예시 | 위치 |
|---|---|---|
| React 컴포넌트 | `medicine-card.tsx` | `ui/` |
| 스타일 | `styles.ts`, `*.css` | `ui/` |
| 컴포넌트 전용 뷰 상태 hook | `use-medicine-card-open.ts` | `ui/` (또는 컴포넌트 파일 내부) |
| 폼 상태 hook | `use-medicine-form.ts` | `model/` (비즈니스 검증 포함 시) |
| 서버 상태 hook | `use-medicines.ts`, `use-add-medicine.ts` | `model/` |
| Zustand/Jotai 스토어 | `medicine-store.ts` | `model/` |
| Zod 스키마 / 타입 | `medicine-schema.ts`, `types.ts` | `model/` |
| 데이터 Context provider | `current-user-context.tsx` | `model/` |
| UI 테마/Modal Context | `theme-context.tsx` | `ui/` 또는 `app/` |
| 날짜 포맷터 | `format-date.ts` | `lib/` |
| 문자열 파서 | `parse-dosage.ts` | `lib/` |
| 밸리데이터 (순수 함수) | `validate-dosage.ts` | `lib/` |
| 타입 가드 | `is-medicine.ts` | `lib/` |
| 도메인 무관 유틸 hook | `use-debounce.ts`, `use-interval.ts` | `lib/` |
| 상수 / enum | `medicine-status.ts` | `config/` |
| 상태 라벨 맵 | `medicine-status-labels.ts` | `config/` |
| 테이블 컬럼 정의 | `page-columns.ts` | `config/` |
| Feature flag | `feature-flags.ts` | `config/` (주로 shared/config) |
| 라우트 경로 상수 | `route-paths.ts` | `shared/config/` |
| Raw API 함수 | `medicine-api.ts` | **entities만** `api/` |
| Query keys + queryFn | `medicine-query-keys.ts` | **entities만** `api/` |
| mutationOptions 래퍼 | `medicine-mutations.ts` | **entities만** `api/` |

---

## Hook 분류 결정 트리

hook이 어디 가야 할지는 특히 헷갈린다. 이 트리를 따라가라:

```
이 hook은...
│
├─ 서버 상태(useQuery/useMutation)를 건드리나?
│  └─ YES → features/*/model 또는 entities/*/model
│
├─ Zustand/Jotai/전역 상태를 건드리나?
│  └─ YES → model (스토어가 있는 레이어)
│
├─ 도메인 규칙/조건을 판단하나?
│  (예: "이 약은 하루 복용량이 초과되었는가?")
│  └─ YES → model
│
├─ UI 전용 뷰 상태만 다루나?
│  (예: 카드 펼침, 입력 포커스, 호버)
│  └─ YES → ui/ (또는 컴포넌트 파일 내부)
│
├─ 도메인 무관 유틸인가?
│  (예: debounce, interval, mediaQuery, localStorage)
│  └─ YES → lib/ (주로 shared/lib)
│
└─ 위 중 어디에도 해당 안 됨
   └─ 책임이 섞여 있다는 신호. 분리부터 하라.
```

### 예시

**`useMedicineForm`** — 약 추가 폼 상태, zod 검증, submit 핸들러
- 비즈니스 검증 포함 → `features/add-medicine/model/`

**`useDialogOpen`** — 다이얼로그 열림/닫힘 boolean
- 순수 UI 상태 → `shared/ui/dialog/` 또는 컴포넌트 파일 내부

**`useMedicineList`** — medicines 쿼리 + 필터링 상태
- 서버 상태 → `features/medicine-list/model/` 또는 `entities/medicine/model/`

**`useDebounce<T>(value, delay)`** — 입력 디바운스
- 도메인 무관 유틸 → `shared/lib/`

**`useAddMedicine`** — `useMutation` + dialog/toast 조립
- 서버 상태 + 부수효과 → `features/add-medicine/model/`

---

## Type 분류

| 타입 종류 | 위치 |
|---|---|
| 도메인 엔티티 타입 (`Medicine`, `User`) | `entities/*/model/types.ts` |
| API 응답/요청 DTO | `entities/*/api/types.ts` (또는 같은 파일 안에 co-locate) |
| 폼 상태 타입 (feature 고유) | `features/*/model/types.ts` |
| 컴포넌트 props 타입 | 컴포넌트 파일 안 (export 필요 시 `ui/types.ts`) |
| 공통 유틸 타입 (`Nullable<T>`, `DeepPartial<T>`) | `shared/lib/` 또는 `shared/model/` |

**금지**: 레이어/슬라이스에 `types/` 또는 `types.ts`만 있는 단일 덩어리 파일. 타입은 **사용처 옆에** co-locate한다.

---

## config vs lib 구분

자주 헷갈리는 두 세그먼트:

| | `config` | `lib` |
|---|---|---|
| **본질** | 변하지 않는 값 | 다른 모듈을 돕는 코드 |
| **예시** | 상수, enum, 라벨 맵, 테이블 정의 | formatter, parser, validator, 유틸 hook |
| **특징** | 대부분 `export const` | 대부분 `export function` |
| **기준** | "이건 값인가?" | "이건 동작인가?" |

**회색 지대**:
- **상태 라벨 맵** (`{ active: '활성', inactive: '비활성' }`) → `config/`
- **상태를 받아 라벨을 리턴하는 함수** (`getStatusLabel(status)`) → `lib/` (단, 단순 매핑이면 config의 맵만 두는 게 낫다)
- **zod 스키마** → `model/` (타입 + 검증 로직의 복합체, 비즈니스 의미를 가짐)

---

## 안티패턴: Essence 기반 네이밍 금지

다음 폴더 이름은 **어떤 세그먼트 안에서도** 쓰지 마라. 공식 FSD 안티패턴이며 코드 발견 가능성을 해친다:

- ❌ `hooks/`
- ❌ `types/`
- ❌ `components/`
- ❌ `utils/`
- ❌ `helpers/`
- ❌ `constants/`

**왜**: "훅이니까 hooks/에 있어야지"는 essence(무엇인가)를 기준으로 분류하는 것이다. FSD는 purpose(왜 여기 있는가)를 기준으로 분류한다. `use-medicine-form.ts`가 `features/add-medicine/model/`에 있으면 "이건 약 추가 feature의 비즈니스 로직"이라는 정보를 구조로 전달한다. `hooks/`에 있으면 "이건 hook이다"라는 무의미한 정보만 전달한다.

**대안**: 세그먼트 안에서 더 쪼개야 한다면 **목적** 기반 이름 사용.
- ✅ `features/add-medicine/model/form/`, `features/add-medicine/model/validation/`
- ✅ `entities/medicine/lib/format/`, `entities/medicine/lib/parse/`

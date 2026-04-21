# Default Template — 시작점으로 쓰는 기본 골격

> **이 템플릿은 "이렇게 하면 된다"가 아니라 "이렇게 시작하면 편하다"의 의미다.** 각 프로젝트의 백엔드 응답 shape, 인증 흐름, 에러 처리 규칙이 다르므로 반드시 사용자와 검토 후 조정한다.
> 스킬 호출 시 먼저 `@jigoooo/api-client` 최신 docs를 조회해 이 템플릿이 여전히 유효한지 확인한다. 유효하지 않으면 이 파일을 먼저 업데이트한 뒤 사용자 작업을 진행한다.

## 목차

- [파일 구성 (기본 제안)](#파일-구성-기본-제안)
- [1. shared/adapter/api-type.ts](#1-sharedadapterapi-typets--타입-정의) — 타입 정의
- [2. shared/adapter/adapter.ts](#2-sharedadapteradapterts--제네릭-유틸) — 제네릭 유틸
- [3. shared/adapter/response-adapter.ts](#3-sharedadapterresponse-adapterts--응답-정규화) — 응답 정규화
- [4. shared/adapter/api-with-adapter.ts](#4-sharedadapterapi-with-adapterts--공개-함수) — 공개 함수
- [5. shared/adapter/index.ts](#5-sharedadapterindexts--public-api) — Public API
- [6. app/providers/api-bootstrap.ts](#6-appprovidersapi-bootstrapts--초기화) — 초기화
- [7. entities/<entity>/api/<entity>-api.ts](#7-entitiesentityapientity-apits--실제-사용) — 실제 사용
- [프로젝트별 커스터마이징 체크리스트](#프로젝트별-커스터마이징-체크리스트)
- [마지막 업데이트 메모](#마지막-업데이트-메모)

## 파일 구성 (기본 제안)

```
src/
├── app/providers/
│   └── api-bootstrap.ts          # initApi() 호출
├── shared/adapter/
│   ├── api-type.ts               # 타입 정의
│   ├── adapter.ts                # Adapter 유틸
│   ├── response-adapter.ts       # 응답 정규화
│   ├── api-with-adapter.ts       # 공개 함수
│   └── index.ts                  # public API
└── entities/<entity>/api/
    └── <entity>-api.ts           # 실제 API 함수들
```

---

## 1. `shared/adapter/api-type.ts` — 타입 정의

```ts
export type ApiArgs<P = object, Q = object, D = object> = {
  path?: P;
  params?: Q;
  data?: D;
};

// 정규화된 공개 shape — feature/UI가 의존하는 타입
export type AdapterResponseType<TData> = {
  code: number;
  data?: TData | null;
  message: string;
  success: boolean;
  error?: string | string[] | null;
  timestamp?: number;
};

// 백엔드 성공 응답 — 프로젝트별로 다를 수 있음
export type SuccessApiResponse<TData> = {
  success: true;
  data?: TData | null;
  message?: string;
  timestamp: number;
};

// 백엔드 실패 응답 — 프로젝트별로 다를 수 있음
export type ErrorApiResponse = {
  success: false;
  error: string | string[];
  statusCode: number;
  timestamp: number;
};

export type RawApiResponse<TData> = SuccessApiResponse<TData> | ErrorApiResponse;
```

**⚠️ 프로젝트별 조정 포인트**:
- 백엔드가 `success` 필드 대신 HTTP status로만 판별한다면 `RawApiResponse` union을 다시 짠다.
- 에러가 `{ code, message, details }` 같은 구조라면 `ErrorApiResponse`를 바꾸고 `ResponseAdapter`도 맞춰 수정한다.
- pagination 메타가 필요하면 `AdapterResponseType`에 optional 필드 추가.

---

## 2. `shared/adapter/adapter.ts` — 제네릭 유틸

```ts
export class Adapter {
  private static value: unknown;

  static from<Source>(originData: Source) {
    this.value = originData;
    return this;
  }

  static to<Input, Output>(mapperFn: (value: Input) => Output) {
    return mapperFn(this.value as Input);
  }
}
```

**⚠️ 대안**: 단순 `pipe()` 함수로 바꿔도 된다. 팀 취향. 이 파일은 거의 변하지 않는다.

---

## 3. `shared/adapter/response-adapter.ts` — 응답 정규화

```ts
import type { AdapterResponseType, RawApiResponse } from './api-type';

export class ResponseAdapter<TData> {
  private readonly value: RawApiResponse<TData>;
  private readonly statusCode: number;

  constructor(obj: RawApiResponse<TData>, statusCode: number) {
    this.value = obj;
    this.statusCode = statusCode;
  }

  adapt(): AdapterResponseType<TData> {
    if (this.value.success === false) {
      const errorArray = Array.isArray(this.value.error) ? this.value.error : [this.value.error];
      return {
        code: this.statusCode,
        success: false,
        message: errorArray.join(', '),
        error: this.value.error,
        timestamp: this.value.timestamp,
      };
    }

    return {
      code: this.statusCode,
      success: true,
      message: this.value.message ?? 'Success',
      data: this.value.data,
      timestamp: this.value.timestamp,
    };
  }
}
```

**⚠️ 프로젝트별 조정 포인트**: 백엔드 응답 shape가 다르면 `adapt()` 내부 로직을 그 shape에 맞게 재작성한다. 이게 "응답 어댑터"의 본래 목적 — 백엔드의 특이한 응답 구조를 여기서만 알게 하고 나머지 레이어는 `AdapterResponseType`만 보면 된다.

---

## 4. `shared/adapter/api-with-adapter.ts` — 공개 함수

```ts
import { Adapter } from './adapter';
import type { AdapterResponseType, RawApiResponse } from './api-type';
import { ResponseAdapter } from './response-adapter';

function getStatus(response: unknown): number {
  if (typeof response === 'object' && response !== null && 'status' in response) {
    const { status } = response;
    return typeof status === 'number' ? status : 0;
  }
  return 0;
}

export async function apiWithAdapter<T>(api: Promise<unknown>): Promise<AdapterResponseType<T>> {
  const response = await api;

  return Adapter.from(response).to((item: RawApiResponse<T>) =>
    new ResponseAdapter(item, getStatus(response)).adapt(),
  );
}
```

**⚠️ 확인 포인트**: `@jigoooo/api-client`의 응답이 `{ status, data }` 형태가 아닐 수 있다. 스킬 호출 시 최신 docs에서 응답 구조를 재확인하고 `getStatus`와 `apiWithAdapter`를 맞춘다.

---

## 5. `shared/adapter/index.ts` — Public API

```ts
export { apiWithAdapter } from './api-with-adapter';
export type { AdapterResponseType } from './api-type';
```

`Adapter`, `ResponseAdapter`, raw 타입은 export 하지 않는다 — 구현 세부사항이므로 외부 소비자가 의존하면 안 된다.

---

## 6. `app/providers/api-bootstrap.ts` — 초기화

```ts
import { initApi } from '@jigoooo/api-client';

import { useAuthStore, refreshTokenApi } from '@/entities/auth';
// ⚠️ 프로젝트별: 라우터/환경변수 의존성은 각자 바꾼다
import { API_BASE_URL } from '@/shared/config/api-url';

export function bootstrapApi() {
  initApi({
    baseURL: import.meta.env.DEV ? import.meta.env.VITE_API_PREFIX || '/api' : API_BASE_URL,

    shouldSkipAuth(config) {
      // 인증 header를 붙이지 않을 경로 — 프로젝트 규칙에 맞춰 조정
      return (
        config.url?.includes('/auth/login') ||
        config.url?.includes('/auth/refresh') ||
        false
      );
    },

    getToken: () => {
      return useAuthStore.getState().accessToken;
    },

    refreshTokenFn: async () => {
      const state = useAuthStore.getState();
      const refreshToken = state.refreshToken;
      if (!refreshToken) {
        throw new Error('리프레시 토큰이 없습니다');
      }
      const res = await refreshTokenApi(refreshToken);
      if (!res.success || !res.data) {
        throw new Error('토큰 갱신 실패');
      }
      state.actions.setAuth({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      return res.data.accessToken;
    },

    onUnauthorized: () => {
      useAuthStore.getState().actions.clearAuth();
      // ⚠️ 라우팅 방식은 프로젝트마다 다름 (react-router / tanstack-router / window.location)
      window.location.href = '/login';
    },

    retryConfig: {
      maxRetries: 1,
      retryDelay: 0,
      maxQueueSize: 50,
      shouldRetry: (error) => {
        const url = error.config?.url ?? '';
        if (url.includes('/auth/')) return false;
        return error.response?.status === 401;
      },
    },
  });
}
```

**⚠️ 프로젝트별 조정 포인트**:
- 인증 스토어의 경로/API (zustand / redux / jotai / context)
- 토큰 갱신 엔드포인트 이름
- 인증 실패 시 리다이렉트 방법 (router 종류)
- skip 대상 URL 목록
- retry 정책 (maxRetries, 어떤 status에서 retry할지)
- dev/test용 mock adapter (있다면 `axiosOptions.adapter`에 주입)

호출 위치: `src/main.tsx` 또는 `src/app/providers/app-provider.tsx`에서 React 렌더 **전에** `bootstrapApi()`를 한 번 호출.

---

## 7. `entities/<entity>/api/<entity>-api.ts` — 실제 사용

```ts
import { api } from '@jigoooo/api-client';

import type {
  LoginRequest,
  LoginResponse,
  AuthTokens,
} from '../model/types';
import { apiWithAdapter } from '@/shared/adapter';

export const loginApi = (data: LoginRequest) =>
  apiWithAdapter<LoginResponse>(api.post('/auth/login', data));

export const refreshTokenApi = (refreshToken: string) =>
  apiWithAdapter<AuthTokens>(api.post('/auth/refresh', { refreshToken }));

export const logoutApi = () =>
  apiWithAdapter<null>(api.post('/auth/logout'));
```

### 네이밍 규칙

- 함수 이름: `<verb><Entity>Api` — 예: `loginApi`, `addMedicineApi`, `getMedicineListApi`
- 파일 이름: `<entity>-api.ts` — 예: `auth-api.ts`, `medicine-api.ts`
- 위치: `entities/<entity>/api/<entity>-api.ts`

### 작성 규칙

- **한 함수 = 한 HTTP 호출 = 한 `apiWithAdapter`**. 여러 호출 묶지 말 것.
- 가능하면 **arrow function + implicit return** 으로 한 줄 유지. 복잡한 변환 로직이 필요하면 그건 feature/model의 일이다.
- 타입 파라미터 `<TResponse>`는 반드시 넣는다 — 없으면 반환 타입이 `unknown`이 된다.
- 요청 데이터 타입은 `entities/<entity>/model/types.ts`에서 import.
- `api.get/post/put/delete`의 세부 시그니처 (params, headers 등)는 최신 `@jigoooo/api-client` docs에서 확인 — 버전이 올라갈 수 있다.

### TanStack Query와의 연결

`fsd-refactor` 스킬의 rules.md § 3이 정의하는 패턴과 이어진다:

- `entities/medicine/api/medicine-api.ts` — raw API 함수 (이 파일)
- `entities/medicine/api/medicine-query-keys.ts` — `createQueryKeys` + `queryFn: medicineApi.xxx` 참조
- `entities/medicine/api/medicine-mutations.ts` — `mutationOptions({ mutationFn: medicineApi.xxx })`
- `features/<feature>/model/use-xxx.ts` — `useMutation`/`useQuery`에 위 options를 스프레드 + 부수효과 조립

---

## 프로젝트별 커스터마이징 체크리스트

스킬이 실제 셋업/마이그레이션을 수행할 때 사용자에게 묻거나 확인해야 할 항목:

1. **백엔드 응답 shape** — 성공/실패 판별 필드, 에러 포맷, 메타 필드
2. **인증 스토어** — 라이브러리(zustand/jotai/redux), 파일 경로, 상태 구조
3. **토큰 갱신 API** — 엔드포인트 이름, 요청/응답 shape
4. **라우터** — 인증 실패 시 리다이렉트 방법
5. **개발용 mock** — 사용 여부, 활성화 조건 (env flag)
6. **retry 정책** — 재시도 횟수, 어떤 status/endpoint에서 재시도
7. **환경 변수** — `VITE_API_PREFIX`, `API_BASE_URL` 등의 이름/위치
8. **기존 `shared/adapter/` 존재 여부** — 있으면 덮어쓸지 병합할지 확인

---

## 마지막 업데이트 메모

`@jigoooo/api-client`의 API (특히 `initApi` 옵션, `api` 메서드 시그니처, 응답 shape)는 변할 수 있다. 스킬 호출 시마다 Context7/npm에서 최신 docs를 조회하고, 이 템플릿이 더 이상 맞지 않으면 **이 파일부터 업데이트한 뒤** 사용자 작업을 진행한다. 업데이트 후에는 어떤 부분이 바뀌었는지 사용자에게 간단히 알려준다.

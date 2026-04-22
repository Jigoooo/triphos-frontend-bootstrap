---
name: triphos-api-client-setup
description: 템플릿 baseline 이후의 API 작업을 다룬다. 새 entity API 추가, 기존 raw API migration, auth/api customization, apiWithAdapter 확장을 수행할 때 사용한다.
argument-hint: "[add|migrate|customize] [target?]"
---

# triphos-api-client-setup

이 스킬은 baseline 생성 스킬이 아니다. baseline은 `triphos-frontend-init`와 `triphos-frontend-adopt`가 제공한다.

## 담당 범위

- 새 entity API 파일 추가
- 새 entity `query-keys.ts`, `query-options.ts`, `mutation-options.ts` wrapper 추가
- 기존 raw `fetch` / `axios` 호출을 `apiWithAdapter` 패턴으로 migration
- auth bootstrap, token refresh, transformRequest/Response, retryConfig 같은 고급 customization
- 프로젝트별 응답 shape 차이에 맞춘 adapter/type 조정

## 기본 원칙

- `src/shared/api/`는 공용 baseline으로 유지한다.
- entities API 호출은 `apiWithAdapter<T>(api.method(...))` 형태를 기본으로 한다.
- query key는 `@lukemorales/query-key-factory`로 관리한다.
- feature는 entity의 `queryOptions` / `mutationOptions` wrapper를 `useQuery` / `useMutation`에 직접 넣어 사용한다.
- 프로젝트별 응답 shape가 다르면 무작정 템플릿을 복사하지 말고 adapter/type을 먼저 맞춘다.
- 작업 후에는 `pnpm verify:api`, `pnpm lint`, `pnpm typecheck`를 통과시킨다.

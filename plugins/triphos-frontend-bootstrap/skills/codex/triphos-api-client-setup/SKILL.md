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

## 계약 확인 게이트

- 작업 시작 전에 `src/shared/api/adapter/`, `src/shared/api/wrapper/api-with-adapter.ts`, `src/app/providers/api-bootstrap.ts`, `src/shared/api/lib/api-url.ts`, `.env`, `src/shared/api/type/api-type.ts`를 읽고 기존 baseline과 템플릿 기본값이 남아 있는지 확인한다.
- `VITE_API_URL=http://localhost`, `VITE_API_PORT=3001`, `VITE_SUFFIX_API_ENDPOINT=api`, `success/data/message/timestamp/error/statusCode` 같은 값과 필드명은 예시일 뿐, 그 자체로 실제 백엔드 계약 근거가 되지 않는다.
- 저장소 코드, OpenAPI/백엔드 문서, 사용자 지시 어디에도 실제 계약이 없으면 API 추가/수정 전에 "이 예시 값을 유지할지, 실제 URL/응답 필드로 교체할지"를 사용자에게 반드시 묻는다.
- 실제 계약 근거가 있으면 그 값을 기준으로 구현하되, 문서가 없는 추론이 섞인 부분은 사용자에게 명시한다.

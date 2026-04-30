---
name: triphos-api-client-setup
description: 템플릿 baseline 이후의 API 작업을 다룬다. 새 entity API 추가, 기존 raw API migration, auth/api customization, apiWithAdapter 확장을 수행할 때 사용한다.
argument-hint: "[add|migrate|customize] [target?]"
level: 2
triggers: ["api 셋업", "apiWithAdapter", "entity api", "새 entity API", "raw API migration", "api migration", "auth bootstrap", "token refresh"]
---

# triphos-api-client-setup

<Purpose>
템플릿 baseline 이후의 API 작업 surface — 새 entity API 추가, 기존 raw API migration, auth/api customization, apiWithAdapter 확장을 일관된 패턴으로 처리한다.
</Purpose>

<Use_When>
- 새 entity API 파일 추가 (`src/entities/<name>/api`, `query-keys`, `query-options`, `mutation-options`)
- 기존 raw `fetch` / `axios` 호출을 `apiWithAdapter` 패턴으로 migration
- auth bootstrap, token refresh, transformRequest/Response, retryConfig 같은 고급 customization
- 프로젝트별 응답 shape 차이에 맞춘 adapter/type 조정
- API DTO, form/env/persisted state처럼 런타임 검증이 필요한 계약의 `zod` schema-first 정의
</Use_When>

<Do_Not_Use_When>
- baseline 자체가 없거나 오래됨 → `triphos-frontend-init` (새) / `triphos-frontend-adopt` (기존)
- FSD 레이어 위반/슈퍼 컴포넌트 → `triphos-fsd-refactor`
- 훅 lint / React Compiler 정리 → `triphos-react-lint-rules`
- 테마 토큰 작업 → `triphos-theme-setup`
</Do_Not_Use_When>

<Why_This_Exists>
API 레이어는 매번 같은 한 세트(api + query-keys + query-options + mutation-options + public export)가 함께 가야 verifier와 query-key-factory의 가정이 깨지지 않는다. 사용자가 한 파일만 추가하고 멈추면 query 미스가 생기고 retry/transform 같은 advanced 기능이 우회된다. 이 스킬은 그 세트를 강제한다.
</Why_This_Exists>

<Language_Policy>
- 사용자에게 보이는 설명, 질문, 진행 상황, 오류 요약, 최종 보고는 사용자의 마지막 실질 요청 언어를 따른다.
- 한국어가 포함되었거나 언어 판단이 애매하면 한국어로 답한다.
- 기술 토큰(`SSR`, `SPA`, `app`, `app-ssr`, 명령어, 경로, 패키지명, API 이름, 코드 식별자)은 원문을 유지한다.
- 세부 기준은 [language-policy.md](../../../references/shared/language-policy.md)를 따른다.
</Language_Policy>

<Inputs>
- 작업 모드: `add` | `migrate` | `customize`
- 대상 entity 또는 module 경로 (선택)
- 백엔드 응답 shape 또는 OpenAPI/문서 (있으면 우선 참조)
</Inputs>

<Read_First>
- baseline 파일이 없거나 오래된 프로젝트라면 [default-template.md](../../../references/skill-bundles/triphos-api-client-setup/default-template.md)를 읽고 현재 템플릿의 API 형태를 확인한다.
- 프로젝트에 이미 `src/shared/api/`가 있으면 템플릿보다 현재 코드와 백엔드 계약을 우선한다.
</Read_First>

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
- 런타임 검증이 필요한 API 계약은 `zod` schema를 먼저 정의하고 타입은 `z.infer`로 파생한다. 순수 UI props/내부 계산 타입은 plain TypeScript type을 허용한다.
- 프로젝트별 응답 shape가 다르면 무작정 템플릿을 복사하지 말고 adapter/type을 먼저 맞춘다.
- 작업 후에는 `pnpm verify:api`, `pnpm lint`, `pnpm typecheck`를 통과시킨다.

<Steps>
1. **계약 확인** — 작업 시작 전에 `src/shared/api/adapter/`, `src/shared/api/wrapper/api-with-adapter.ts`, `src/app/providers/api-bootstrap.ts`, `src/shared/api/lib/api-url.ts`, `.env`, `src/shared/api/type/api-type.ts`를 읽고 기존 baseline과 템플릿 기본값이 남아 있는지 확인한다.
2. **baseline 스캔** — `src/entities/**/api`, `src/entities/**/model/query-keys.ts`, `query-options.ts`, `mutation-options.ts` 존재 여부를 스캔하고 누락 파일을 리포트한다.
3. **모드별 진행**:
   - `add`: 새 entity는 `api`, zod schema-first DTO/type, `query-keys`, `query-options`, `mutation-options`, public `index.ts` export를 한 세트로 처리.
   - `migrate`: `fetch(`, `axios`, `@jigoooo/api-client` 직접 호출, `api.get/post/put/patch/delete`를 전체 `src/`에서 검색하고 각 후보를 `migrate`/`defer`/`pass` 중 하나로 분류.
   - `customize`: auth bootstrap, token refresh, transform/retry는 `src/shared/api/adapter/`와 `api-bootstrap.ts`에서 변경. 프로젝트별 응답 shape는 adapter/type 조정 우선.
4. **검증** — `pnpm verify:api`, `pnpm lint`, `pnpm typecheck` 통과.
</Steps>

<Tool_Usage>
- 스캔: `rg "fetch\("`, `rg "axios"`, `rg "@jigoooo/api-client"`, `rg "api\.(get|post|put|patch|delete)\("`
- 검증: `pnpm verify:api`, `pnpm lint`, `pnpm typecheck`
- query key: `@lukemorales/query-key-factory`
- schema/type: `zod` schema + `z.infer`
- 백엔드 계약 확인 — 코드/OpenAPI/문서/사용자 지시 중 실제 근거가 있는 것을 기준으로 사용
</Tool_Usage>

<Escalation_And_Stop_Conditions>
- 백엔드 계약(URL, 응답 필드명, 상태 코드)에 대한 실제 근거가 어디에도 없으면 추가/수정 전에 "예시 값을 유지할지, 실제 URL/응답 필드로 교체할지" 사용자에게 반드시 묻는다.
- `VITE_API_URL=http://localhost`, `VITE_API_PORT=3001`, `VITE_SUFFIX_API_ENDPOINT=api`, `success/data/message/timestamp/error/statusCode`는 예시일 뿐, 그 자체로 실제 백엔드 계약 근거가 되지 않는다.
- migration이면 모든 후보를 `migrate`/`defer`/`pass` 중 하나로 분류하지 않은 채 commit 금지.
- `verify:api`가 없는 레거시 프로젝트에서는 최소한 raw HTTP scan, TypeScript check, lint 결과를 대체 검증으로 남긴다.
</Escalation_And_Stop_Conditions>

<Final_Checklist>
- [ ] 계약 확인: `adapter/`, `api-with-adapter.ts`, `api-bootstrap.ts`, `api-url.ts`, `.env`, `api-type.ts` 모두 검토
- [ ] 새 entity 추가 시 `api` + `query-keys` + `query-options` + `mutation-options` + public `index.ts` 한 세트로 처리
- [ ] 런타임 검증이 필요한 DTO/form/env/persisted state 계약은 `zod` schema-first + `z.infer` 적용
- [ ] migration 시 raw HTTP 후보 모두 분류 (`migrate`/`defer`/`pass`)
- [ ] 백엔드 계약 근거 확인 또는 사용자 confirm
- [ ] `pnpm verify:api`, `pnpm lint`, `pnpm typecheck` 통과 (또는 verifier 부재 시 대체 검증 결과 보고)
</Final_Checklist>

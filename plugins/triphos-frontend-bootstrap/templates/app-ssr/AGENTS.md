# Triphos 프론트엔드 앱 가이드

이 앱은 Triphos frontend bootstrap으로 생성된 회사 기본 세팅입니다.

`docs/README.md`를 이 저장소의 system of record로 취급한다.

먼저 읽기:

- `docs/product/README.md`
- `docs/architecture/README.md`
- `docs/quality/verification-matrix.md`
- `docs/plans/README.md`
- `docs/decisions/README.md`

핵심 규칙:

- FSD 레이어는 `app`, `pages`, `widgets`, `features`, `entities`, `shared`로 유지한다.
- FSD 관련 구조 판단이나 리팩토링 전에는 `triphos-fsd-refactor` 스킬과 그 참조 규칙을 먼저 읽고 기준으로 삼는다.
- React 훅, React Compiler, inline style 규칙 판단 전에는 `triphos-react-lint-rules` 스킬을 먼저 참고한다.
- API 추가, migration, auth/bootstrap customization 전에는 `triphos-api-client-setup` 스킬을 먼저 읽고 기준으로 삼는다.
- 비트리비얼 작업은 `docs/plans/active/<date>-<slug>/PLAN.md`, `STATUS.md`, `DECISIONS.md`, `VERIFICATION.md`를 남긴다.
- 프론트엔드 변경 후에는 `pnpm verify:frontend`를 통과시키기 전에는 작업을 완료로 간주하지 않는다.
- 스타일은 inline `style` props를 기본으로 한다.
- `className`은 scrollbar 같은 좁은 utility case 외에는 사용하지 않는다.
- theme 기반 스타일은 `shared/theme`와 `useColors()`를 통해서만 소비한다.
- `shared/ui`는 승인된 starter surface로 취급하고, 새 공용 UI 동작은 `/starter`에서 먼저 검증한다.
- 브라우저 기반 하네스 검증은 앱 런타임 계측 없이 `/`와 `/starter` DOM/스크린샷 회귀면을 기준으로 유지한다.
- API 호출은 `src/shared/api/`와 `apiWithAdapter` baseline을 따른다. raw `fetch`, 직접 `axios`, bare `api.get/post` 반환은 baseline 위반이다.
- API 관련 요청이 들어오면 구현 전에 최소 `src/shared/api/adapter/`, `src/shared/api/wrapper/api-with-adapter.ts`, `src/app/providers/api-bootstrap.ts`를 먼저 확인하고 기존 baseline을 확장하는 방식으로 작업한다.
- `VITE_API_URL=http://localhost`, `VITE_API_PORT=3001`, `VITE_SUFFIX_API_ENDPOINT=api`, `success/data/message/timestamp/error/statusCode` 같은 템플릿 기본값은 실제 백엔드 계약으로 간주하지 않는다. 저장소 코드, 백엔드 문서, 사용자 지시 어디에도 실제 계약이 없으면 API 작업 전에 유지/교체 여부를 사용자에게 반드시 확인한다.
- query key는 `@lukemorales/query-key-factory`로 관리하고, entity `model/`에 `query-keys.ts`, `query-options.ts`, `mutation-options.ts`를 둔다.
- feature는 entity wrapper를 `useQuery`, `useMutation`에 직접 넣어 사용하고 query key/mutationFn을 다시 inline 정의하지 않는다.
- React, Vite, TypeScript, MCP 설정을 바꾸기 전에는 공식 문서나 MCP-backed reference를 먼저 확인한다.
- 라우팅은 `@tanstack/react-router`의 **file-based**만 사용한다. 새 route는 `src/routes/<segment>.tsx`에 `createFileRoute('/<segment>')({ component })`로 추가하고, root layout은 `src/routes/__root.tsx`만 수정한다. `createBrowserRouter`/`react-router-dom` 사용은 금지이며, 결정 전 [TanStack Router file-based routing 문서](https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing)를 먼저 확인한다.
- 이 앱은 **TanStack Start (SSR + Nitro)** 기반이다. `@tanstack/react-start`, `@tanstack/react-router-ssr-query`, `nitro` 가 필수 dep이며, `vite.config.ts`의 `tanstackStart()` + `nitro()` plugin 순서를 임의로 바꾸지 않는다. dev는 `pnpm dev`, production build는 `pnpm build`, 서버 실행은 `pnpm start` (`node .output/server/index.mjs`)이다.
- SSR 환경에서 깨지는 모듈 top-level browser API 호출(`window`, `document`, `localStorage`, `sessionStorage`, `navigator`, `matchMedia`)은 금지이며, 반드시 `@/shared/lib/is-browser`의 `isBrowser` 가드 또는 `useEffect` / `@/shared/hooks/lifecycle/use-mounted`의 `useMounted` 안에서만 호출한다. zustand persist의 storage는 `createJSONStorage(() => (isBrowser ? localStorage : noopStorage))` 패턴을 따른다. createPortal 사용 컴포넌트는 mount 전 `null` 반환으로 hydration 충돌을 피한다.
- 메타/SEO는 `src/routes/<segment>.tsx`의 `head: () => ({ meta, links })` 또는 `src/routes/__root.tsx`의 `head` 옵션으로 관리한다. 결정 전 [TanStack Start head/meta 문서](https://tanstack.com/start/latest/docs/framework/react/guide/document-head)를 먼저 확인한다.
- server-only 로직은 `createServerFn` 또는 route file 내 `loader`로 분리한다. 결정 전 [TanStack Start server functions 문서](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)를 먼저 확인한다.

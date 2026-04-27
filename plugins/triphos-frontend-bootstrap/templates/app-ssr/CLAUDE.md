# Triphos Frontend App Guidance For Claude

이 앱은 회사 프론트엔드 최초 세팅 기준점입니다.

`docs/README.md`를 이 저장소의 system of record로 취급한다.

먼저 읽기:

- `docs/product/README.md`
- `docs/architecture/README.md`
- `docs/quality/verification-matrix.md`
- `docs/plans/README.md`
- `docs/decisions/README.md`

기본 규칙:

- FSD 구조를 우선 유지한다.
- FSD 관련 구조 판단이나 리팩토링 전에는 `triphos-fsd-refactor` 스킬과 그 참조 규칙을 먼저 읽고 기준으로 삼는다.
- React 훅, React Compiler, inline style 규칙 판단 전에는 `triphos-react-lint-rules` 스킬을 먼저 참고한다.
- API 추가, migration, auth/bootstrap customization 전에는 `triphos-api-client-setup` 스킬을 먼저 읽고 기준으로 삼는다.
- 비트리비얼 작업은 `docs/plans/active/<date>-<slug>/PLAN.md`, `STATUS.md`, `DECISIONS.md`, `VERIFICATION.md`를 남긴다.
- 프론트엔드 변경 후에는 `pnpm verify:frontend`를 통과시키기 전에는 작업을 완료로 간주하지 않는다.
- 스타일은 inline `style` props를 기본으로 한다.
- `className`은 사실상 금지이며, scrollbar 같은 예외만 허용한다.
- theme는 `shared/theme`와 `useColors()`를 통해서만 소비한다.
- `shared/ui` starter와 `/starter` route를 회귀 검증면으로 사용한다.
- 브라우저 기반 검증은 앱 런타임 계측 없이 `/`와 `/starter` DOM/스크린샷 회귀면을 기준으로 유지한다.
- API 호출은 `src/shared/api/`와 `apiWithAdapter` baseline을 따른다. raw `fetch`, 직접 `axios`, bare `api.get/post` 반환은 baseline 위반이다.
- API 관련 요청이 들어오면 구현 전에 최소 `src/shared/api/adapter/`, `src/shared/api/wrapper/api-with-adapter.ts`, `src/app/providers/api-bootstrap.ts`를 먼저 확인하고 기존 baseline을 확장하는 방식으로 작업한다.
- `VITE_API_URL=http://localhost`, `VITE_API_PORT=3001`, `VITE_SUFFIX_API_ENDPOINT=api`, `success/data/message/timestamp/error/statusCode` 같은 템플릿 기본값은 실제 백엔드 계약으로 간주하지 않는다. 저장소 코드, 백엔드 문서, 사용자 지시 어디에도 실제 계약이 없으면 API 작업 전에 유지/교체 여부를 사용자에게 반드시 확인한다.
- query key는 `@lukemorales/query-key-factory`로 관리하고, entity `model/`에 `query-keys.ts`, `query-options.ts`, `mutation-options.ts`를 둔다.
- feature는 entity wrapper를 `useQuery`, `useMutation`에 직접 넣어 사용하고 query key/mutationFn을 다시 inline 정의하지 않는다.
- React, Vite, TypeScript, MCP 설정을 바꿀 때는 공식 문서나 MCP-backed reference를 먼저 확인한다.
- 라우팅은 `@tanstack/react-router`의 **file-based**만 사용한다. 새 route는 `src/routes/<segment>.tsx`에 `createFileRoute('/<segment>')({ component })`로 추가하고, root layout은 `src/routes/__root.tsx`만 수정한다. `createBrowserRouter`/`react-router-dom` 사용은 금지이며, 결정 전 [TanStack Router file-based routing 문서](https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing)를 먼저 확인한다.
- 이 앱은 **TanStack Start (SSR + Nitro)** 기반이다. `@tanstack/react-start`, `@tanstack/react-router-ssr-query`, `nitro` 가 필수 dep이며, `vite.config.ts`의 `tanstackStart()` + `nitro()` plugin 순서를 임의로 바꾸지 않는다. dev는 `pnpm dev`, production build는 `pnpm build`, 서버 실행은 `pnpm start` (`node .output/server/index.mjs`)이다.
- SSR 환경에서 깨지는 모듈 top-level browser API 호출(`window`, `document`, `localStorage`, `sessionStorage`, `navigator`, `matchMedia`)은 금지이며, 반드시 `@/shared/lib/is-browser`의 `isBrowser` 가드 또는 `useEffect` / `@/shared/hooks/lifecycle/use-mounted`의 `useMounted` 안에서만 호출한다. zustand persist의 storage는 `createJSONStorage(() => (isBrowser ? localStorage : noopStorage))` 패턴을 따른다. createPortal 사용 컴포넌트는 mount 전 `null` 반환으로 hydration 충돌을 피한다.
- 메타/SEO는 `src/routes/<segment>.tsx`의 `head: () => ({ meta, links, scripts })`로 관리하며 반드시 `@/shared/lib/seo`의 `buildMeta` + `jsonLdScript` 헬퍼를 사용한다. 결정 전 [TanStack Start head/meta 문서](https://tanstack.com/start/latest/docs/framework/react/guide/document-head)와 [SEO 정책](#seo--a11y-가이드)을 먼저 확인한다. SEO/a11y 키워드(검색 노출, OG, JSON-LD, sitemap, llms.txt, 접근성, axe, Lighthouse)가 들어오면 `triphos-seo-a11y-audit` 스킬로 분기한다.
- server-only 로직은 `createServerFn` 또는 route file 내 `loader`로 분리한다. 결정 전 [TanStack Start server functions 문서](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)를 먼저 확인한다.

## SEO & a11y 가이드

### head() 패턴

모든 page route는 다음 형태로 head를 정의한다.

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { buildMeta, jsonLdScript, jsonLdWebPage } from '@/shared/lib/seo';

export const Route = createFileRoute('/about')({
  head: () => {
    const built = buildMeta({
      title: 'About Triphos',
      description: 'Triphos를 소개합니다.',
      path: '/about',
    });
    return {
      meta: built.meta,
      links: built.links,
      scripts: [jsonLdScript(jsonLdWebPage({ name: 'About', description: '소개', path: '/about' }))],
    };
  },
  component: AboutPage,
});
```

`buildMeta` 옵션: `title` / `description` / `path`(필수) + `ogType` / `ogImage` / `twitterCard` / `noIndex`(선택). `noIndex: true`이면 og/twitter/canonical은 자동 제거되고 `robots: noindex, nofollow`만 emit된다. 자세한 옵션은 `triphos-seo-a11y-audit` 스킬 또는 `references/shared/seo-policy.md` 참조.

### JSON-LD 타입 선택

- `jsonLdWebPage` — 일반 페이지 (기본)
- `jsonLdArticle` — 블로그/뉴스
- `jsonLdBreadcrumbs` — 깊은 navigation
- `jsonLdOrganization` / `jsonLdWebSite` — `__root.tsx`에서만 한 번씩

### sitemap / llms / robots 갱신

- `src/routes/sitemap[.]xml.ts`의 `ENTRIES`에 `{ path, changefreq, priority }` 추가 (priority 0~1, lastmod ISO 8601)
- `src/routes/llms[.]txt.ts`(요약본)와 `src/routes/llms-full[.]txt.ts`(전체본) 둘 다 갱신
- `src/routes/robots[.]txt.ts`는 `getBaseUrl()`로 절대 URL Sitemap을 생성한다. `public/robots.txt` 정적 파일은 사용 금지.
- `seo-config.ts`의 `SITE_NAME` / `SITE_DESCRIPTION` / `DEFAULT_LOCALE` / `DEFAULT_OG_IMAGE`는 프로젝트 시작 시 실제 값으로 교체.

### a11y 체크리스트

- button / link: visible text 또는 `aria-label` (icon-only는 `aria-label` 필수)
- `<img>`: `alt` 필수 (장식이면 `alt=""`)
- form input: `<label htmlFor>`로 매칭
- `aria-hidden="true"` 요소는 focusable 자식 금지
- `role="button"` 등 ARIA 위젯은 `tabIndex=0` + 키보드 핸들러 동반
- color contrast WCAG AA 4.5:1 — 색은 항상 `useColors()` 토큰 (inline hex 금지). 위반 시 `shared/theme`에서 토큰을 조정한다.
- focus-visible outline은 CSS reset에서 제거하지 않는다.

### 검증 명령

- `pnpm verify:seo` — head/meta/buildMeta 정적 휴리스틱
- `pnpm lint` — eslint-plugin-jsx-a11y 정적 검증
- `pnpm verify:a11y` — @axe-core/playwright runtime (serious/critical 0). 새 라우트 추가 시 `scripts/verify-a11y.mjs`의 URL 배열도 갱신.
- `pnpm verify:lighthouse` — perf>=0.85 / a11y>=0.95 / best-practices>=0.9 / seo>=0.95

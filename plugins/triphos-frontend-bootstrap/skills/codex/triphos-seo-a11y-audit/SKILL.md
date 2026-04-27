---
name: triphos-seo-a11y-audit
description: SSR 프로젝트의 SEO와 접근성을 점검·패치한다. SSR 전용.
model: sonnet
---

# triphos-seo-a11y-audit

## 먼저 읽기

- [../../../references/shared/seo-policy.md](../../../references/shared/seo-policy.md)
- [../../../references/shared/a11y-baseline.md](../../../references/shared/a11y-baseline.md)
- [../../../references/shared/frontend-policy.md](../../../references/shared/frontend-policy.md)

## 사전 조건 (SSR 전용)

이 스킬은 **TanStack Start (SSR + Nitro) 베이스 프로젝트** 전용이다. 호출 직후 다음을 확인:

- `package.json` dependencies에 `@tanstack/react-start`가 있는지
- `vite.config.ts`에 `tanstackStart()` 등록 여부
- `src/router.tsx`에 `getRouter()` export 존재

위 셋 중 하나라도 없으면 **SPA 베이스**로 판단하고 즉시 종료. 사용자에게 다음 안내:

> "SPA 베이스 프로젝트는 0.8.0 SEO/a11y 인프라 대상이 아닙니다. SSR/SEO가 필요하면 새 프로젝트로 `triphos-frontend-init --template app-ssr`를 권장합니다."

## 사용 시점

- 사용자가 "SEO 점검", "메타 부족", "검색 노출", "OG/Twitter card", "JSON-LD", "구조화 데이터", "sitemap", "robots", "llms.txt", "a11y", "접근성", "스크린 리더", "alt 텍스트", "aria", "Lighthouse", "axe" 키워드를 언급
- 새 페이지 추가 직후 head() 비어있을 때
- `verify:seo` 또는 `lint(jsx-a11y)` 또는 `verify:a11y` 또는 `verify:lighthouse` 실패 시

## 워크플로우 (SSR 확정 후)

1. 다음을 순차 실행하고 각 결과를 분리해 보고
   - `pnpm verify:seo` (head/meta/OG/JSON-LD 정적 휴리스틱)
   - `pnpm lint` (eslint-plugin-jsx-a11y 포함)
   - `pnpm verify:a11y` (@axe-core/playwright runtime serious/critical 0)
   - `pnpm verify:lighthouse` (perf>=0.85, a11y>=0.95, best-practices>=0.9, seo>=0.95)
2. 실패 항목별 fix
   - **SEO meta**: 페이지 head()에 `buildMeta({ title, description, path, ogType?, ogImage?, twitterCard?, noIndex? })` 적용. 옵션 의미는 아래 표 참조.
   - **JSON-LD**: `jsonLdOrganization/jsonLdWebSite/jsonLdWebPage/jsonLdArticle/jsonLdBreadcrumbs` 중 페이지 타입에 맞는 것을 `jsonLdScript()`로 wrap해 head() scripts에 추가
   - **sitemap**: `src/routes/sitemap[.]xml.ts`의 `ENTRIES` array에 `{ path, changefreq, priority }` 추가. `priority`는 0~1, `lastmod`은 ISO 8601(`YYYY-MM-DD`)
   - **llms.txt / llms-full.txt**: 두 파일 모두 갱신 — `src/routes/llms[.]txt.ts`의 `buildLlmsTxt()`(요약본)와 `src/routes/llms-full[.]txt.ts`의 `buildLlmsFullTxt()`(전체본)
   - **robots.txt**: 정적 파일이 아니라 `src/routes/robots[.]txt.ts` file-based route로 동적 생성된다 (`Sitemap:` 절대 URL 표준 준수). 정적 `public/robots.txt`는 사용 금지.
   - **a11y static**: button에 `aria-label` 또는 visible text, `<img>` `alt` 필수, form `<label htmlFor>` 매칭, `aria-hidden`은 focusable 제외, `role` ARIA 패턴 준수
   - **a11y runtime (axe)**: violation node selector 따라 markup 수정. color-contrast는 `shared/theme` 토큰으로 조정 (inline 색 하드코딩 금지)
   - **Lighthouse**: perf 미달 시 lazy load / image optim / font preload, seo 미달 시 meta description 누락 여부, best-practices 미달 시 deprecation 경고
3. 회귀 확인 — 위 4개 명령 모두 다시 통과
4. 변경된 페이지의 SSR HTML을 `pnpm build && pnpm start && curl http://localhost:3000/<path>`로 OG/JSON-LD가 실제 응답에 포함되는지 한 번 확인. `/sitemap.xml`, `/robots.txt`, `/llms.txt`도 함께 점검.
5. 새 라우트를 추가했다면 앱 저장소의 `verify-a11y.mjs` (scripts 디렉터리)의 검증 URL 배열에 그 path를 추가한다 (axe runtime 검증 자동 확장이 아님)

## buildMeta 옵션

| 옵션 | 타입 | 기본값 | 비고 |
|---|---|---|---|
| `title` | string | (필수) | 60자 자동 clamp |
| `description` | string | (필수) | 160자 자동 clamp |
| `path` | string | (필수) | canonical/og:url 생성용 — 절대 URL 또는 `/path` |
| `ogType` | `'website' \| 'article' \| 'product'` | `'website'` | schema.org/og 매핑 |
| `ogImage` | string | `DEFAULT_OG_IMAGE` (`/og-default.png`) | 1200x630 권장. 절대 URL이면 그대로, `/path`면 `getBaseUrl()`과 결합 |
| `twitterCard` | `'summary' \| 'summary_large_image'` | `'summary_large_image'` | |
| `noIndex` | boolean | `false` | `true`이면 og/twitter/canonical 생략하고 `robots: noindex, nofollow`만 emit |

`og:site_name`/`og:locale`은 `seo-config.ts`의 `SITE_NAME`/`DEFAULT_LOCALE`(기본 `ko_KR`) 상수로 자동 채워진다. 다국어/리브랜드 시 `seo-config.ts`를 직접 수정.

## sitemap 패턴

- `src/routes/sitemap[.]xml.ts`의 `ENTRIES`에 정적 path. 동적 path(예: /posts/:id)는 db/CMS 쿼리해서 server handler에서 push
- changefreq: 자주 갱신 weekly, 거의 안 변경 yearly
- priority: 1.0 홈, 0.8 주요, 0.5 부수, 0.3 약관 (helper가 0~1 범위로 클램프)

## a11y 점검 항목

- 모든 button/link에 visible text 또는 `aria-label`
- 모든 `<img>`에 `alt` (장식이면 `alt=""`)
- 모든 form input에 `<label htmlFor>` 매칭
- `aria-hidden="true"` 요소는 키보드 focus 불가
- `role` 정의 시 ARIA pattern 준수 (e.g., `role="button"`이면 `tabIndex=0` + `onKeyDown`)
- color contrast WCAG AA 4.5:1 (theme 토큰 단계)
- focus-visible outline 유지 (CSS reset에서 제거 금지)

## Lighthouse threshold 운용

- 환경 의존 (CI vs local 머신 부하)으로 ±0.05 변동 정상
- flaky하면 `TRIPHOS_SKIP_LIGHTHOUSE=1` 환경변수로 일시 skip
- production deploy 직전 manual run 권장
- numberOfRuns를 늘려 평균값 잡기는 `lighthouserc.json` 수정

## 참고

- TanStack Start SEO docs: https://tanstack.com/start/latest/docs/framework/react/guide/seo
- jsx-a11y 룰: https://github.com/jsx-eslint/eslint-plugin-jsx-a11y
- @axe-core/playwright: https://github.com/dequelabs/axe-core-npm
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
- llms.txt 표준 초안: https://llmstxt.org/

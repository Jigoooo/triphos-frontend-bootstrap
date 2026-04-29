---
name: triphos-frontend-init
description: 새 디렉터리에 Triphos 프론트엔드 앱을 생성한다. 템플릿에는 shared/api, auth/token/member baseline, auth-aware api-bootstrap, repo-local Codex/Claude hooks, verifier scripts가 기본 포함된다.
argument-hint: "[target-directory]"
level: 3
triggers: ["프론트엔드 init", "frontend init", "새 앱 생성", "triphos init", "scaffold app"]
pipeline: ["triphos-seo-a11y-audit", "triphos-api-client-setup"]
next-skill: triphos-api-client-setup
handoff: inline
---

# triphos-frontend-init

<Purpose>
새 디렉터리에 Triphos 프론트엔드 앱을 생성하고 강한 baseline(shared/api, auth/member, repo-local hooks, verifier scripts, docs system-of-record)을 단일 스캐폴드 명령으로 설치한다.
</Purpose>

<Use_When>
- 새 프론트엔드 프로젝트를 처음 시작할 때 — 빈 디렉터리 또는 허용된 런타임 상태물만 있는 디렉터리
- 사용자가 "새 앱 생성", "frontend init", "scaffold", "triphos init"을 언급
- SSR/SEO 필요한 풀스택(TanStack Start + Nitro)과 SPA(TanStack Router + Vite) 중 선택이 필요할 때
</Use_When>

<Do_Not_Use_When>
- 이미 코드가 있는 기존 프로젝트를 baseline에 정렬 → `triphos-frontend-adopt`
- 단일 entity API 추가, raw API migration → `triphos-api-client-setup`
- FSD 레이어 재구성/리팩토링 → `triphos-fsd-refactor`
- SSR 베이스에서 SEO/a11y 점검 → `triphos-seo-a11y-audit`
</Do_Not_Use_When>

<Why_This_Exists>
프론트엔드 프로젝트는 시작 첫날의 baseline이 끝까지 따라간다. shared/api, auth/token/member, query-key-factory 같은 baseline을 직접 손으로 짜면 변종이 생기고 관리되는 verifier가 작동하지 않게 된다. 이 스킬은 모든 baseline을 단일 스캐폴드 명령으로 설치해 변종을 차단한다.
</Why_This_Exists>

<Language_Policy>
- 사용자에게 보이는 설명, 질문, 진행 상황, 오류 요약, 최종 보고는 사용자의 마지막 실질 요청 언어를 따른다.
- 한국어가 포함되었거나 언어 판단이 애매하면 한국어로 답한다.
- 기술 토큰(`SSR`, `SPA`, `app`, `app-ssr`, 명령어, 경로, 패키지명, API 이름, 코드 식별자)은 원문을 유지한다.
- 세부 기준은 [language-policy.md](../../../references/shared/language-policy.md)를 따른다.
</Language_Policy>

<Inputs>
- 대상 디렉터리 경로 (target-directory) — 선택 입력. 사용자가 명시하지 않으면 현재 작업 디렉터리를 대상 디렉터리로 사용한다. 대상은 비어 있거나 런타임 상태물만 포함해야 한다.
- 패키지 이름 (`--name`) — 선택 입력. 사용자가 명시하지 않으면 대상 디렉터리명에서 npm-safe 기본값을 파생한다. 패키지명만 따로 묻지 않는다.
- 템플릿 종류 — `app` (SPA) 또는 `app-ssr` (TanStack Start + Nitro). 명시 입력이 없으면 자동 기본값으로 선택하지 않는다.
- SSR/SEO 필요 여부 — 시작 전 1회 사용자 확인 (랜딩/마케팅/공개 페이지 → SSR, 내부 도구/대시보드 → SPA). 사용자가 `--template app`/`--template app-ssr` 또는 동등한 자연어로 이미 선택한 경우만 생략한다.
</Inputs>

<Read_First>
- [stack.md](../../../references/shared/stack.md) — 스택 / 패키지 매니저 / 기본 스크립트 baseline
- [init-contract.md](../../../references/shared/init-contract.md) — 생성 후 검증 계약
</Read_First>

분기 시점 lazy (`references/shared/`, `references/internal/` 아래):

- 최신 stack 버전 확인 필요 시: `latest-stack.md`
- inline 스타일·className·shared/theme 정책 재확인 필요 시: `frontend-policy.md`
- 환경 진단/`doctor.mjs` 실패 분기: `internal/frontend-doctor.md`

<Steps>
1. **대상/SSR 결정 게이트**: 스캐폴드 실행 전에 SSR/SPA 선택이 명시됐는지 확인한다. 대상 디렉터리가 없으면 현재 작업 디렉터리를 대상 디렉터리로 사용하며 따로 묻지 않는다. 패키지 이름이 없으면 대상 디렉터리명 기준 기본값을 사용하며 따로 묻지 않는다. SSR/SPA 선택이 없으면 "이 프로젝트에 SSR/SEO가 필요합니까? 랜딩/마케팅/제품 소개/공개 페이지가 주이면 SSR, 내부 도구/대시보드이면 SPA입니다. SSR 또는 SPA로 답해주세요."를 묻고 답변을 기다린다. Codex Default mode에서 `request_user_input`을 사용할 수 없어도 일반 메시지로 질문하고 이 턴의 스캐폴드 실행은 중단한다.
2. 환경이 불명확하면 `validate-plugin-structure.mjs`와 `doctor.mjs`를 먼저 실행한다.
3. 대상 디렉터리가 새 디렉터리이거나 허용된 런타임 상태물만 포함하는지 확인한다.
4. SSR이면 `node ../../../scripts/scaffold-app.mjs --target <directory> --template app-ssr --install`, SPA이면 `--template app`(생략 가능)로 실행한다. 현재 작업 디렉터리가 대상이면 `--target`은 생략해도 된다. 사용자가 패키지 이름을 명시한 경우에만 `--name <package-name>`을 추가한다.
5. 생성 직후 `pnpm verify:frontend`와 `pnpm build` 또는 `pnpm typecheck`로 검증한다.
6. standalone 저장소면 `node ../../../scripts/finalize-init.mjs --target <directory>`로 `git init`과 initial commit을 수행한다. 상위 git 저장소가 있으면 skip한다.
</Steps>

<Tool_Usage>
- 스캐폴드는 항상 `scaffold-app.mjs`로만 실행. 템플릿 파일 수동 부분 복사 금지.
- 검증: `pnpm verify:frontend`, `pnpm build`, `pnpm typecheck`.
- 환경 진단: `validate-plugin-structure.mjs`, `doctor.mjs`.
- standalone 저장소 마무리: `finalize-init.mjs`.
</Tool_Usage>

<Escalation_And_Stop_Conditions>
- `<Read_First>`의 모든 파일을 읽고 템플릿/정책 계약을 기억한 뒤 스캐폴드 실행. 미읽음 상태로 진행 금지.
- 생성 후 누락된 파일이나 실패한 검증이 있으면 완료로 보고하지 말고, 누락 항목과 수정 계획을 먼저 처리한다.
- SSR/SPA 결정이 모호하면 사용자에게 1회 질의하고 스캐폴드 실행을 중단한다. "답을 못 들으면 SPA"로 자동 진행하지 않는다. 대상 디렉터리 생략은 모호함이 아니며 현재 작업 디렉터리를 사용한다.
- 스캐폴드 실패 시 실패 원인을 고친 뒤 재실행 — 부분 복사로 우회하지 않는다.
</Escalation_And_Stop_Conditions>

<Final_Checklist>
- [ ] 대상 앱 `package.json`에 `verify:frontend`, `verify:fsd`, `verify:react-rules`, `verify:api`, `verify:visual`, `verify:e2e`, `verify:uat` 존재
- [ ] `src/shared/api`, `src/shared/theme`, `src/entities/auth`, `src/entities/member`, `docs/`, `.codex/`, `.claude/` 모두 존재
- [ ] `pnpm verify:frontend` 통과
- [ ] `pnpm build` 또는 `pnpm typecheck` 통과
- [ ] standalone 저장소면 `git init` + initial commit 완료
</Final_Checklist>

## SSR/SEO 계약 (TanStack Start, Nitro)

- `--template app-ssr`로 생성된 프로젝트는 **TanStack Start + Nitro Node 서버** 기반이다. dev=`pnpm dev`, build=`pnpm build`, run=`pnpm start` (`node .output/server/index.mjs`).
- SSR 전환은 한 번에 결정하고 그 후 retrofit하지 않는다. 사용자가 SPA로 시작했다가 나중에 SSR이 필요하면 새 프로젝트로 재생성을 권장한다.
- SSR 환경에서 깨지는 모듈 top-level browser API 호출(`window`, `document`, `localStorage`, `sessionStorage`, `navigator`, `matchMedia`)은 금지다. `@/shared/lib/is-browser`의 `isBrowser` 가드 또는 `useEffect`/`useMounted` 안에서만 호출한다. zustand persist storage는 `createJSONStorage(() => (isBrowser ? localStorage : noopStorage))` 패턴, createPortal 컴포넌트는 mount 전 `null` 반환으로 hydration 충돌을 피한다.
- 메타/SEO는 `src/routes/<segment>.tsx`의 `head: () => ({ meta, links })` 또는 `__root.tsx`의 `head` 옵션으로 관리한다. 결정 전 [TanStack Start docs](https://tanstack.com/start/latest/docs/framework/react)를 먼저 확인한다.
- server-only 로직은 `createServerFn` 또는 route file `loader`로 분리한다.
- SSR 변경 전에 fixture에서 `pnpm build && pnpm start`로 SSR HTML 응답을 한 번 확인한다.

## 라우팅 계약 (file-based, 무조건)

- 라우팅은 `@tanstack/react-router`의 **file-based routing**만 사용한다. `createRouter`/`createRoute`/`createRootRoute`를 직접 호출하지 않는다.
- 새 route는 `src/routes/<segment>.tsx`에 `createFileRoute('/<segment>')({ component })` 형태로 추가한다.
- root layout은 `src/routes/__root.tsx`의 `createRootRoute({ component })`로만 정의한다.
- `routeTree.gen.ts`는 `tsr generate` 또는 vite 시작 시 자동 생성되며 git에 커밋하지 않는다.
- `react-router-dom`/`react-router`/`createBrowserRouter`/`createHashRouter`/`createMemoryRouter` 사용은 금지다. verifier가 차단한다.
- 라우팅 관련 결정 전에 [TanStack Router file-based routing 공식 문서](https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing)와 [Vite Plugin 가이드](https://tanstack.com/router/latest/docs/framework/react/installation/with-vite)를 먼저 확인한다.

## post-init 작업 가이드

- init 직후 사용자가 페이지/위젯 추가, 디자인 변경, 참고자료 요청을 보낼 수 있다. 요구사항이 모호하면 **추측하지 말고** 핵심 1~3개 질문으로 좁힌다 (목적, 사용자 시나리오, 시각 톤).
- 페이지 컴포넌트는 placeholder 한 줄로 끝내지 않는다. `useColors()` 토큰 매핑, 시멘틱 영역 (hero/section/cta), 반응형 break (`useMediaQuery`)를 최소 한 번씩 활용한다.
- 컬러/스타일 제안 전에 `src/shared/theme/`의 토큰을 먼저 읽고 후보 2~3개를 사용자에게 제시한 뒤 결정한다.
- 외부 디자인 영감/참고자료가 필요하면 Context7 또는 web fetch로 1차 조사 후 출처를 명시한다.

## 템플릿 계약

- 이 스킬로 생성된 저장소가 강한 Triphos 하네스의 기본 대상이다.
- 생성 결과에는 `docs/` system-of-record, repo-local hooks, verifier scripts, browser harness scripts가 기본 포함된다.
- `src/shared/api/`와 `apiWithAdapter`가 기본 포함된다.
- `entities/auth`, token store, 최소 member store, auth-aware `api-bootstrap`이 기본 포함된다.
- query key는 `@lukemorales/query-key-factory`로 관리하고, entity `model/`에 `query-keys.ts`, `query-options.ts`, `mutation-options.ts`가 기본 포함된다.
- `.codex/hooks.json`, `.claude/settings.json`, verifier scripts가 기본 포함된다.
- standalone 저장소면 initial commit까지 자동화할 수 있고, 모노레포 하위 패키지는 상위 저장소를 사용하므로 nested git bootstrap은 하지 않는다.

<Handoff>
- SSR 베이스(`--template app-ssr`)이고 사용자가 SEO/a11y/sitemap/JSON-LD/Lighthouse/접근성 키워드를 언급 → `triphos-seo-a11y-audit`
- 새 entity API 추가나 raw API migration → `triphos-api-client-setup`
- 기존 프로젝트를 동일 baseline으로 올릴 때 → `triphos-frontend-adopt`
- FSD 레이어 재구성, 200줄 초과 파일 분리 → `triphos-fsd-refactor`
- 훅 lint/React Compiler 정리 → `triphos-react-lint-rules`
- 테마 토큰 추가/수정 → `triphos-theme-setup`
</Handoff>

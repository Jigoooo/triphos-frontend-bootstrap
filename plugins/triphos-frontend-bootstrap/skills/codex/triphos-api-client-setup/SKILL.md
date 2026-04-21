---
name: triphos-api-client-setup
description: @jigoooo/api-client + apiWithAdapter 패턴으로 API 레이어 셋업, 새 entity API 추가, raw fetch 마이그레이션. 호출 시 Context7로 최신 docs 조회 후 template 동기화부터 진행. 모든 변경은 "제안 → 사용자 확인 → 실행". 키워드: api 셋업, apiWithAdapter, entity api.
argument-hint: [init|add|migrate] [entity-name?]
allowed-tools: Read Edit Write Grep Glob Bash(pnpm add *) Bash(pnpm list *) Bash(pnpm info *) Bash(cat package.json) Bash(ls *) Bash(find *)
---

# triphos-api-client-setup

`@jigoooo/api-client` + `apiWithAdapter` 패턴으로 API 레이어를 셋업/확장하는 스킬.

## 언제 쓰는가

### 수동 호출
- `/triphos-api-client-setup init` — 신규 프로젝트에 adapter + bootstrap 전부 생성
- `/triphos-api-client-setup add <entity>` — 기존 프로젝트에 새 entity의 api 파일 생성
- `/triphos-api-client-setup migrate <path>` — 기존 raw fetch 코드를 apiWithAdapter로 변환

### 자동 호출 조건
- 사용자가 "api 셋업", "api 레이어", "apiWithAdapter", "새 entity api", "@jigoooo/api-client" 언급
- `fsd-refactor`가 entities/api 파일 진단 중 apiWithAdapter 패턴 미준수를 발견했을 때 (fsd-refactor는 직접 수정하지 않고 이 스킬을 호출하거나 사용자에게 실행을 제안)

## 핵심 원칙

1. **제안만 한다, 말없이 바꾸지 않는다.** 모든 파일 생성/수정은 사용자에게 diff를 먼저 보여주고 확인받은 뒤 진행한다. `fsd-refactor`에서 호출된 경우에도 동일하다.
2. **프로젝트별 변이점을 가정하지 않는다.** 백엔드 응답 shape, 인증 스토어, 라우터, 환경변수, 에러 포맷은 **전부** 프로젝트마다 다르다. 기본 template은 시작점일 뿐, 반드시 사용자 확인 후 조정한다.
3. **스킬 호출 시 먼저 최신 docs를 가져온다.** `@jigoooo/api-client`의 `initApi` 옵션, `api` 메서드, 응답 shape는 버전에 따라 바뀔 수 있다. 호출마다 Context7/npm에서 최신 정보를 조회하고, 필요하면 `references/default-template.md`를 먼저 업데이트한 뒤 사용자 작업을 진행한다.

## 워크플로우

### Phase 0 — 최신 Docs 조회 및 Template 동기화 (모든 모드에서 실행)

**항상 이 단계를 먼저 실행한다.** 생략 금지.

1. **npm 버전 확인**
   ```bash
   pnpm info @jigoooo/api-client version description repository
   ```
   또는 `cat package.json`에서 현재 설치된 버전 확인.

2. **Context7로 문서 조회**
   - `mcp__claude_ai_Context7__resolve-library-id(libraryName: "@jigoooo/api-client")`
   - 매칭되는 ID가 없으면 `query-docs`에 직접 `/jigoooo/api-client` 같은 ID를 시도해보고, 실패 시 WebFetch fallback:
     - `https://www.npmjs.com/package/@jigoooo/api-client`
     - GitHub repo URL (npm info에서 찾음)
   - 확인할 정보:
     - `initApi` 옵션 목록 (baseURL, getToken, refreshTokenFn, onUnauthorized, retryConfig, shouldSkipAuth 등)
     - `api` 객체 메서드 시그니처 (`api.get/post/put/delete/patch`)
     - 응답 객체 shape (`{ status, data }`인지 다른 구조인지)
     - Deprecated된 옵션이나 새로 추가된 옵션

3. **`references/default-template.md`와 비교**
   현재 template이 가정하는 것 (§6 bootstrap, §4 api-with-adapter의 getStatus 로직)과 최신 docs를 대조:
   - 옵션 이름/타입이 달라졌는가?
   - 응답 shape가 바뀌었는가?
   - 새로운 권장 패턴이 있는가?

4. **드리프트 처리**
   - **드리프트 없음** → 사용자에게 "최신 @jigoooo/api-client v{version} 확인 완료. template 변경 불필요."라고 알리고 Phase 1로.
   - **드리프트 있음** → `references/default-template.md`의 해당 섹션을 **먼저 업데이트**하고, 사용자에게 "다음 부분이 최신 docs와 달라 template을 업데이트했습니다: {변경사항}. 작업을 계속 진행할까요?"라고 확인 후 Phase 1로.
   - **template 업데이트 실패/불확실** → 사용자에게 직접 판단을 요청. 자동으로 추측해서 진행하지 않는다.

### Phase 1 — 모드 판정

사용자 입력을 보고 어느 모드인지 정한다:

- **`init`**: 프로젝트에 `shared/adapter/`가 없거나 비어있고, 전체 셋업이 필요할 때
- **`add <entity>`**: `shared/adapter/`는 이미 있고, 새 entity의 api 파일만 추가할 때
- **`migrate <path>`**: 기존 raw `fetch`/`axios` 호출을 쓰는 파일을 apiWithAdapter 패턴으로 변환할 때

모드가 애매하면 사용자에게 물어라.

### Phase 2 — 사전 점검

공통:
- `package.json`에 `@jigoooo/api-client` 설치 여부 확인. 없으면 `pnpm add @jigoooo/api-client` 실행 **여부를 사용자에게 묻고** 실행.
- `src/shared/adapter/`, `src/app/providers/` 디렉토리 존재 확인. 없으면 만들지 여부를 먼저 보고.
- 기존 파일이 있다면 **절대 말없이 덮어쓰지 않는다.** diff를 보여주고 사용자 선택(덮어쓰기/병합/중단).

모드별:
- **init**: 기존 API 호출 코드가 있는지 grep으로 확인 (`axios.`, `fetch(`, `api.` 등). 있으면 "기존 API 코드가 있습니다. migrate 모드로 전환할까요?" 제안.
- **add**: entity 디렉토리 존재 확인 (`src/entities/<entity>/`). 없으면 만들지 확인. `model/types.ts` 존재 확인, 없으면 요청/응답 타입 생성을 사용자에게 맡기거나 스켈레톤 제안.
- **migrate**: 대상 파일의 기존 코드를 Read로 분석. 요청/응답 타입, 에러 처리 로직, 사용처를 파악해 사용자에게 요약 보고 후 진행.

### Phase 3 — 프로젝트 커스터마이징 질문

템플릿을 그대로 쓰면 안 되므로 필요한 정보를 묻는다. **이미 알 수 있는 건 묻지 않는다** (코드베이스 탐색으로 파악 가능한 것들은 먼저 확인).

공통 질문 (init 모드에서 주로):
1. **백엔드 응답 shape** — raw response가 정말 `{ success, data, error, timestamp }` 구조인가? 다르면 어떤 구조인가? (샘플 응답이 있으면 보여달라고 요청)
2. **인증 스토어** — zustand/jotai/redux/context 중 무엇? 파일 경로는? (grep으로 먼저 탐색)
3. **토큰 갱신 엔드포인트** — `/auth/refresh`가 맞는가? 요청/응답 shape는?
4. **skip 대상 URL** — 인증 헤더 없이 호출할 엔드포인트 목록 (로그인, 리프레시, 공개 API 등)
5. **라우터** — react-router / tanstack-router / window.location 중 무엇?
6. **환경변수** — baseURL은 어떤 env 변수에서 오는가? (`VITE_API_PREFIX`, `VITE_API_BASE_URL` 등)
7. **개발용 mock** — 사용하는가? 활성화 조건은?
8. **retry 정책** — 401 외에 retry할 status가 있는가? maxRetries는?

add/migrate 모드에서는 질문이 줄어든다 (보통 entity 이름, 엔드포인트 목록, 요청/응답 타입만).

### Phase 4 — 계획 제시

코드를 쓰기 전에 **반드시** 계획을 보여준다. 예시:

```
## 계획 (api-client-setup init)

### 생성할 파일
1. src/shared/adapter/api-type.ts       (신규, 34줄)
2. src/shared/adapter/adapter.ts        (신규, 12줄)
3. src/shared/adapter/response-adapter.ts (신규, 36줄)
4. src/shared/adapter/api-with-adapter.ts (신규, 20줄)
5. src/shared/adapter/index.ts          (신규, 3줄)
6. src/app/providers/api-bootstrap.ts   (신규, 68줄)

### 수정할 파일
- src/main.tsx — bootstrapApi() 호출 추가 (렌더 전에 한 번)

### 설치할 패키지
- @jigoooo/api-client (최신: v0.x.y)

### 반영할 커스터마이징
- 백엔드 응답 shape: 기본 template과 동일
- 인증 스토어: src/entities/auth/model/auth-store.ts (zustand)
- 토큰 갱신: /api/auth/refresh, 응답 { accessToken, refreshToken }
- 라우터: @tanstack/react-router
- 환경변수: VITE_API_PREFIX (dev), VITE_API_BASE_URL (prod)

### 진행 권한 필요?
위 대로 진행할까요? 수정 사항이 있으면 알려주세요.
```

### Phase 5 — 실행

사용자 승인 후:
1. `pnpm add` 실행 (필요 시)
2. 각 파일 생성/수정 (가능하면 병렬)
3. 생성된 파일 import 경로 확인 (`@/shared/adapter` alias가 tsconfig에 있는지 확인)
4. `pnpm check` (또는 프로젝트의 lint/type 명령) 실행해 에러 없는지 확인
5. 사용자에게 요약 보고 + 다음 단계 제안 (예: "이제 `entities/medicine/api/medicine-api.ts` 같은 entity api를 만들 수 있습니다. 필요하면 `/triphos-api-client-setup add medicine`으로 호출하세요.")

### Phase 6 — 실패 처리

- 타입 에러: 사용자에게 에러 메시지 보여주고 수정 제안
- 빌드 에러: `build-fix` 스킬 제안
- 패키지 설치 실패: 원인 조사 후 사용자에게 보고 (네트워크? 버전 충돌?)

## `fsd-refactor`에서 호출된 경우

`fsd-refactor`가 "entities/medicine/api/medicine-api.ts가 `apiWithAdapter`를 안 씁니다" 같은 위반을 발견하면 이 스킬을 호출할 수 있다. 이 경우:

1. `fsd-refactor`의 진단 결과를 그대로 신뢰하되, 대상 파일은 직접 다시 Read로 확인
2. migrate 모드로 동작
3. **직접 코드를 바꾸지 말고** 사용자에게 diff 제안만 보여준다
4. 사용자가 "진행"해야만 실제 파일 변경

## 참고 파일

- `references/default-template.md` — 5+1+1 파일 구조의 기본 시작점. 프로젝트별로 반드시 조정되어야 함. Context7 drift 발생 시 가장 먼저 업데이트되는 파일.

## 관련 스킬

- **`fsd-refactor`**: entities/api 파일의 위치/네이밍/공개 API 검증. 패턴 위반 발견 시 이 스킬을 호출하거나 사용자에게 수동 호출을 제안.
- **`commit`**: 셋업/마이그레이션 완료 후 커밋 생성.
- **`ts-check`** / **`build-fix`**: 생성된 코드의 타입/빌드 검증 및 에러 해결.

---
name: triphos-fsd-skill-update
description: fsd-refactor의 rules.md를 FSD 공식 docs 최신 버전과 대조해 드리프트 리포트 생성. 공식 변경, 사용자 의도적 차이, 신규 권장사항을 분류하고 승인 후에만 rules.md 업데이트. 수동 전용 (/triphos-fsd-skill-update).
disable-model-invocation: true
effort: high
allowed-tools: Read Edit Write Grep Glob
---

# triphos-fsd-skill-update

`triphos-fsd-refactor` 스킬의 `rules.md`를 Feature-Sliced Design 공식 문서와 동기화 확인하는 스킬.

## 이 스킬은 수동 전용이다

- 사용자가 `/triphos-fsd-skill-update` 또는 "fsd 규칙 업데이트 확인", "fsd 최신 docs 확인" 같이 **명시적으로 호출할 때만** 실행한다.
- 리팩토링 작업 중 자동으로 이 스킬을 호출하지 마라. 규칙 드리프트 확인은 **사용자가 원할 때**만 일어나야 한다.
- 대신 `triphos-fsd-refactor` 실행 중 규칙이 이상해 보이면 사용자에게 "`/triphos-fsd-skill-update`를 돌려 규칙을 검토해보세요"라고 제안하는 것은 허용된다.

## 목적

시간이 지나면 공식 FSD 문서가 업데이트되고, 사용자의 `rules.md`와 공식 사이에 드리프트가 생긴다. 이 스킬은 그 드리프트를 **리포트**하여 사용자가 규칙을 의식적으로 최신화하거나 "공식은 바뀌었지만 나는 원래 방식을 유지하겠다"는 결정을 내리도록 돕는다.

**중요**: 이 스킬은 rules.md를 자동으로 수정하지 않는다. 사용자 승인 후에만 업데이트한다. rules.md는 사용자의 의식적 결정이 담긴 계약서이지, 공식 문서의 복사본이 아니다.

## 워크플로우

### Phase 1 — 현재 rules.md 로딩

```
../triphos-fsd-refactor/references/rules.md
```

이 파일을 처음부터 끝까지 읽는다. 각 섹션의 **규칙**과 **왜(이유)** 부분을 별도로 정리한다. "왜" 섹션은 사용자가 의식적으로 내린 결정이므로, 공식과 달라도 함부로 덮어쓰면 안 된다.

### Phase 2 — 공식 FSD docs 가져오기

Context7 MCP로 다음을 쿼리한다 (가능하면 병렬):

```
mcp__claude_ai_Context7__resolve-library-id(libraryName: "Feature-Sliced Design")
```

라이브러리 ID를 받으면 각 주제별로 `query-docs` 호출:

1. **Layers 정의**: 각 레이어의 책임, widgets 판정 기준, pages/entities/features 차이
2. **Segments 정의**: `ui`, `api`, `model`, `lib`, `config`의 공식 정의와 권장사항
3. **Public API 규칙**: `index.ts` 규칙, cross-import 금지, `@x` notation
4. **Import 방향**: layer dependency 규칙
5. **Anti-patterns**: 공식이 명시한 안티패턴 (essence 기반 네이밍 등)

Context7이 실패하면 firecrawl MCP로 `https://feature-sliced.github.io/documentation/`을 fallback으로 사용.

### Phase 3 — 비교

각 주제별로 사용자의 `rules.md`와 공식을 대조하여 다음 4개 카테고리로 분류한다:

#### (A) 공식이 바뀐 부분 (사용자 규칙 업데이트 고려)
공식 문서가 업데이트되었고, 사용자 규칙이 이제 구버전을 따르는 경우.

예: "공식은 v2.0부터 `processes` 레이어를 완전히 deprecated로 표시. rules.md에는 아직 '사용 금지'로만 적혀 있음 → 업데이트 제안."

#### (B) 사용자 규칙이 공식과 의식적으로 다른 부분 (유지 확인)
사용자가 `rules.md`의 "왜" 섹션에 이유를 명시했거나, 이전 대화에서 의식적으로 선택한 규칙.

예: "공식은 `features/*/api/`를 허용하지만, 이 프로젝트는 TanStack Query + query-key-factory 패턴을 위해 entities에만 api를 둠. '왜' 섹션에 이유 명시됨. → **유지 권장**, 공식 변경 여부만 확인."

#### (C) 공식이 새로 추가한 권장사항 (rules.md에 없음)
공식 문서에 새 섹션이 추가됐지만 rules.md에는 해당 내용이 없는 경우.

예: "공식이 최근 'Shared layer에서 component 컴포지션 패턴' 섹션을 추가. rules.md에는 언급 없음 → 추가 고려."

#### (D) rules.md에는 있지만 공식에 없는 규칙 (프로젝트 고유)
200줄 제한, 슈퍼 컴포넌트 금지 같은 이 프로젝트 고유의 품질 규칙.

예: "200줄 제한은 공식 FSD에 없는 프로젝트 고유 규칙. 드리프트 아님. 그대로 유지."

### Phase 4 — 리포트 생성

사용자에게 다음 형식으로 보여준다:

```
# FSD Rules 드리프트 리포트 (2026-04-11)

## 📊 요약
- (A) 업데이트 권장: 2건
- (B) 유지 확인 필요: 1건
- (C) 신규 권장 추가: 1건
- (D) 프로젝트 고유: 4건 (변경 없음)

## (A) 공식 변경 → 업데이트 권장

### 1. Processes 레이어 deprecation 명시 강화
- **공식**: "processes is deprecated since v2.0. Existing projects should migrate."
- **rules.md § 1 현재**: "processes는 deprecated. 사용 금지."
- **제안**: "마이그레이션 권장" 문구 추가
- **영향**: 낮음 (이미 사용 안 함)

### 2. ...

## (B) 사용자 결정 vs 공식 — 유지 확인

### 1. api 세그먼트 위치
- **공식**: features에도 api 허용
- **rules.md § 2.2**: entities에만 허용 (TanStack Query 패턴 때문)
- **확인 필요**: 이 결정을 계속 유지하시나요? 공식 업데이트에 변경 사항 없음 → **유지 권장**.

## (C) 공식 신규 권장 → 추가 고려

### 1. ...

## (D) 프로젝트 고유 규칙 (변경 없음)
- § 7.1 파일 200줄 제한
- § 7.2 슈퍼 컴포넌트/훅/함수 금지
- § 3 TanStack Query 패턴 (entities/api에 queryOptions + mutationOptions)
- § 4 widgets는 재사용 시에만 (공식의 "single page 독립 블록" 케이스 제외)

---

## 다음 단계

적용하고 싶은 항목을 선택해주세요:
- `A1`: Processes 마이그레이션 권장 문구 추가
- `A2`: ...
- `C1`: 공식 신규 섹션 추가
- `모두`: 위 제안 전부 적용
- `취소`: 변경 없음
```

### Phase 5 — 승인 후 rules.md 업데이트

사용자가 적용할 항목을 선택하면:

1. 해당 섹션만 `rules.md`에서 edit.
2. (B) 카테고리의 결정은 건드리지 마라. "왜" 섹션에 이유가 있는 규칙은 사용자가 명시적으로 "공식 따라가겠다"라고 말할 때만 변경.
3. 변경된 섹션마다 **간단한 주석**으로 "[공식 docs 기준 YYYY-MM-DD 동기화]" 같은 footnote를 달지 마라 — rules.md는 깔끔하게 유지한다.
4. 업데이트 후 사용자에게 diff를 보여주고 최종 확인.

## 실행 시 주의사항

### 리포트는 "제안"이다
이 스킬은 rules.md를 **진단**할 뿐, 진실의 심판관이 아니다. 사용자의 `rules.md`는 "이 프로젝트가 FSD를 어떻게 해석하는가"의 기록이고, 공식과 다른 것 자체는 결함이 아니다.

### "왜"를 존중하라
rules.md의 "왜" 섹션에 이유가 적혀 있다면, 그 결정은 **의식적인** 것이다. 공식이 달라도 자동으로 바꾸지 마라. 사용자가 명시적으로 "이 결정을 재검토하고 싶다"라고 할 때만 변경 제안.

### Context7 실패 시
- firecrawl MCP로 `https://feature-sliced.github.io/documentation/docs/` fallback
- 둘 다 실패하면 사용자에게 알리고 중단 (WebSearch로 넘어가지 마라 — 정확도가 떨어짐)

### 업데이트 주기
이 스킬은 사용자가 원할 때 돌리는 **on-demand** 도구다. 자동 주기적 실행 권장 안 함. 사용자가 월 1회 정도 수동으로 돌리는 정도가 적당하다.

## 참고 파일

- `../triphos-fsd-refactor/references/rules.md` — 업데이트 대상
- FSD 공식: `https://feature-sliced.github.io/documentation/`
- Context7 library ID: `/feature-sliced/documentation`

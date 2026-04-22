# Triphos Frontend App Guidance For Claude

이 앱은 회사 프론트엔드 최초 세팅 기준점입니다.

기본 규칙:

- FSD 구조를 우선 유지한다.
- FSD 관련 구조 판단이나 리팩토링 전에는 `triphos-fsd-refactor` 스킬과 그 참조 규칙을 먼저 읽고 기준으로 삼는다.
- React 훅, React Compiler, inline style 규칙 판단 전에는 `triphos-react-lint-rules` 스킬을 먼저 참고한다.
- 프론트엔드 변경 후에는 `pnpm verify:frontend`를 통과시키기 전에는 작업을 완료로 간주하지 않는다.
- 스타일은 inline `style` props를 기본으로 한다.
- `className`은 사실상 금지이며, scrollbar 같은 예외만 허용한다.
- theme는 `shared/theme`와 `useColors()`를 통해서만 소비한다.
- `shared/ui` starter와 `/starter` route를 회귀 검증면으로 사용한다.
- API 호출은 `src/shared/api/`와 `apiWithAdapter` baseline을 따른다. raw `fetch`, 직접 `axios`, bare `api.get/post` 반환은 baseline 위반이다.
- query key는 `@lukemorales/query-key-factory`로 관리하고, entity `model/`에 `query-keys.ts`, `query-options.ts`, `mutation-options.ts`를 둔다.
- feature는 entity wrapper를 `useQuery`, `useMutation`에 직접 넣어 사용하고 query key/mutationFn을 다시 inline 정의하지 않는다.
- React, Vite, TypeScript, MCP 설정을 바꿀 때는 공식 문서나 MCP-backed reference를 먼저 확인한다.

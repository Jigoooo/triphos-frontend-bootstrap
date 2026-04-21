# Triphos Frontend App Guidance For Claude

이 앱은 회사 프론트엔드 최초 세팅 기준점입니다.

기본 규칙:

- FSD 구조를 우선 유지한다.
- FSD 관련 구조 판단이나 리팩토링 전에는 `triphos-fsd-refactor` 스킬과 그 참조 규칙을 먼저 읽고 기준으로 삼는다.
- React 훅, React Compiler, inline style 규칙 판단 전에는 `triphos-react-lint-rules` 스킬을 먼저 참고한다.
- 스타일은 inline `style` props를 기본으로 한다.
- `className`은 사실상 금지이며, scrollbar 같은 예외만 허용한다.
- theme는 `shared/theme`와 `useColors()`를 통해서만 소비한다.
- `shared/ui` starter와 `/starter` route를 회귀 검증면으로 사용한다.
- `@jigoooo/api-client` 관련 구조는 scaffold가 만든 shared/app 경계를 따른다.
- React, Vite, TypeScript, MCP 설정을 바꿀 때는 공식 문서나 MCP-backed reference를 먼저 확인한다.

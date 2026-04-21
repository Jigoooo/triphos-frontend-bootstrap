# Triphos 프론트엔드 앱 가이드

이 앱은 Triphos frontend bootstrap으로 생성된 회사 기본 세팅입니다.

규칙:

- FSD 레이어는 `app`, `pages`, `widgets`, `features`, `entities`, `shared`로 유지한다.
- FSD 관련 구조 판단이나 리팩토링 전에는 `triphos-fsd-refactor` 스킬과 그 참조 규칙을 먼저 읽고 기준으로 삼는다.
- React 훅, React Compiler, inline style 규칙 판단 전에는 `triphos-react-lint-rules` 스킬을 먼저 참고한다.
- 스타일은 inline `style` props를 기본으로 한다.
- `className`은 scrollbar 같은 좁은 utility case 외에는 사용하지 않는다.
- theme 기반 스타일은 `shared/theme`와 `useColors()`를 통해서만 소비한다.
- `shared/ui`는 승인된 starter surface로 취급하고, 새 공용 UI 동작은 `/starter`에서 먼저 검증한다.
- API bootstrap과 adapter 작업은 scaffold가 만든 shared/app 경계와 `@jigoooo/api-client` 계약을 따른다.
- React, Vite, TypeScript, MCP 설정을 바꾸기 전에는 공식 문서나 MCP-backed reference를 먼저 확인한다.

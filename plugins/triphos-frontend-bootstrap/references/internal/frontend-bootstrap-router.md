# 내부 라우터 가이드

`triphos-frontend-bootstrap` 스킬을 대체하는 내부 라우팅 문서다.

사용자에게 직접 노출되는 스킬이 아니라, 다른 스킬이 plugin 내부 작업을 분기할 때 참고한다.

## 라우팅 기준

- 플러그인 설치 상태 / 환경 점검:
  `scripts/validate-plugin-structure.mjs`, `scripts/doctor.mjs`
- 새 프로젝트 생성:
  `triphos-frontend-init`
- theme token / `src/shared/theme` 작업:
  `triphos-theme-setup`
- starter UI kit / `/starter` 검증면 작업:
  `triphos-frontend-init` 후 `triphos-theme-setup`
- FSD 구조 정리:
  `triphos-fsd-refactor`
- React Compiler / 훅 규칙 / inline style 규칙:
  `triphos-react-lint-rules`
- `@jigoooo/api-client` bootstrap:
  `triphos-api-client-setup`
- FSD 규칙 드리프트 검토:
  `triphos-fsd-skill-update`

## 별칭 메모

- `fsd-refactor` -> `triphos-fsd-refactor`
- `react-lint-rules` -> `triphos-react-lint-rules`
- `api-client-setup` -> `triphos-api-client-setup`
- `fsd-update` / `fsd-skill-update` -> `triphos-fsd-skill-update`

## 원칙

- 사용자에게는 namespaced public skill만 노출한다.
- 내부 라우팅 맥락이 필요하면 이 문서를 읽고, hidden skill 복원은 하지 않는다.

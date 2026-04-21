[English](README.md) | 한국어

# triphos-frontend-bootstrap

Triphos 프론트엔드 최초 세팅을 위한 Git-first dual plugin marketplace 저장소입니다.

## 설치

### Claude Code

```text
/plugin marketplace add https://github.com/Jigoooo/triphos-frontend-bootstrap
/plugin install triphos-frontend-bootstrap
```

### Codex

로컬 체크아웃에서 테스트할 때:

```bash
pnpm run register:codex
```

## 주요 진입점

- `triphos-frontend-bootstrap`: bootstrap 작업 라우터
- `triphos-frontend-doctor`: plugin 구조와 init 전제조건 검증
- `triphos-frontend-init`: 새 Triphos 프론트엔드 앱 생성
- `triphos-theme-setup`: theme/token 규칙 관리

## 포함된 정책 스킬

- `triphos-fsd-refactor`
- `triphos-react-lint-rules`
- `triphos-api-client-setup`
- `triphos-fsd-skill-update`

공개 별칭은 유지됩니다:

- `fsd-refactor`
- `react-lint-rules`
- `api-client-setup`
- `fsd-update`
- `fsd-skill-update`

## 생성 앱 기본 세팅

`triphos-frontend-init`가 만든 앱에는 다음이 기본 포함됩니다.

- `AGENTS.md`, `CLAUDE.md`
- `shared/theme`, `shared/constants`, `shared/types`
- starter `shared/ui`
- `/starter` showcase route
- inline `style` 기본, `className` 금지(예외는 좁은 utility case만 허용)


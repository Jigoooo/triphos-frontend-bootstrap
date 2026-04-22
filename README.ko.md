[English](README.md) | 한국어

# triphos-frontend-bootstrap

Claude Code와 Codex에서 쓰는 Triphos 프론트엔드 부트스트랩 도구입니다.

## 설치

```bash
npx @jigoooo/triphos-frontend-bootstrap@latest
```

설치 후:

- 플러그인 설정
- 전역 `tfb` 설치
- `triphos-frontend-init` 기반 프로젝트 생성
- `tfb update` 기반 업데이트
- `tfb delete` 기반 정리

지원 환경:

- Claude Code
- Codex

## 주요 스킬

- `triphos-frontend-init`
  새 Triphos 프론트엔드 프로젝트를 템플릿 기준으로 생성합니다.

## 정책 스킬

- `triphos-fsd-refactor`
  FSD 구조 정리, 레이어 경계 보정, 잘못 배치된 코드 이동에 사용합니다.
- `triphos-react-lint-rules`
  React 19, React Compiler, hooks/lint 규칙에 맞게 코드와 패턴을 정리할 때 사용합니다.
- `triphos-api-client-setup`
  `@jigoooo/api-client` 기준으로 API bootstrap과 클라이언트 연결 규칙을 맞출 때 사용합니다.
- `triphos-fsd-skill-update`
  FSD 관련 스킬 규칙이나 프로젝트 적용 기준을 업데이트할 때 사용합니다.

프로젝트 생성은 Claude/Codex 안에서 `triphos-frontend-init` 스킬로 수행합니다.

## 정리

```bash
tfb delete
```

이 명령은 Claude/Codex 에 설치된 Triphos 플러그인을 제거하고, 동기화된 Codex 스킬과 Claude 플러그인 캐시 및 marketplace clone 을 정리합니다.
전역 `tfb` CLI 자체는 유지됩니다.

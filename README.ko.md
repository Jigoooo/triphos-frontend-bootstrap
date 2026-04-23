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

## Runtime Activation

- 생성되거나 adopt된 저장소는 tracked `.codex/config.toml`, `.codex/hooks.json`, `.claude/settings.json`을 함께 가진다.
- Codex hooks는 `.codex/config.toml`의 `codex_hooks = true`에 의존한다.
- Claude는 project-level `.claude/settings.json`을 사용하고, `.claude/settings.local.json`이 있으면 로컬에서 우선한다.
- 정책 파일이 저장소에 존재하는 것과 런타임에서 실제 활성화되는 것은 별개이므로 doctor 경로로 둘 다 확인해야 한다.

## Lifecycle 책임

| Surface | 책임 |
| --- | --- |
| install scripts | plugin 등록, marketplace/skills 동기화, activation prerequisite 안내 |
| doctor | Codex activation, Claude settings precedence, install 상태 진단 |
| hooks | relevant 변경에서만 조건부 stop-time verification 실행 |
| skills | scaffold/adopt baseline과 codebase 정렬 |
| docs | 최신 공식 runtime 가정과 운영 복구 경로 기록 |

## 주요 스킬

- `triphos-frontend-init`
  새 Triphos 프론트엔드 프로젝트를 템플릿 기준으로 생성합니다. 강한 Triphos 하네스의 기본 대상은 이 경로로 생성된 저장소입니다.
- `triphos-frontend-adopt`
  기존 프론트엔드 프로젝트를 템플릿과 동일한 Triphos runtime, tooling, API, docs, verification 기준으로 명시적으로 opt-in 정렬합니다.

## 정책 스킬

- `triphos-fsd-refactor`
  FSD 구조 정리, 레이어 경계 보정, 잘못 배치된 코드 이동에 사용합니다.
- `triphos-react-lint-rules`
  React 19, React Compiler, hooks/lint 규칙에 맞게 코드와 패턴을 정리할 때 사용합니다.
- `triphos-api-client-setup`
  baseline이 준비된 뒤 새 entity API 추가, raw API migration, 고급 `@jigoooo/api-client` customization이 필요할 때 사용합니다.
- `triphos-fsd-skill-update`
  FSD 관련 스킬 규칙이나 프로젝트 적용 기준을 업데이트할 때 사용합니다.

프로젝트 생성은 Claude/Codex 안에서 `triphos-frontend-init` 스킬로 수행합니다.
강한 하네스는 기본적으로 init으로 생성된 저장소를 대상으로 하며, 기존 프로젝트는 `triphos-frontend-adopt`를 명시적으로 호출한 경우에만 같은 계약을 적용합니다.
생성된 프로젝트가 standalone 저장소라면 init 흐름이 검증 후 `git init`과 initial commit까지 수행합니다. 상위 git 저장소 안에서 생성되면 nested git bootstrap은 건너뜁니다.

## 정리

```bash
tfb delete
```

이 명령은 Claude/Codex 에 설치된 Triphos 플러그인을 제거하고, 동기화된 Codex 스킬과 Claude 플러그인 캐시 및 marketplace clone 을 정리합니다.
전역 `tfb` CLI 자체는 유지됩니다.

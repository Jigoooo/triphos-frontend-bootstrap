# 내부 Doctor 가이드

`triphos-frontend-doctor` 스킬을 대체하는 내부 환경 점검 문서다.

사용자에게 직접 노출되는 스킬이 아니라, init/API bootstrap 전후에 환경이 불명확할 때 참고한다.

## 실행 순서

1. 구조 검증

```bash
node ../../../scripts/validate-plugin-structure.mjs
```

2. 종합 점검

```bash
node ../../../scripts/doctor.mjs
```

## 확인해야 하는 것

- 루트 Claude marketplace metadata
- 루트 Codex marketplace metadata
- plugin-local manifest
- template app 핵심 파일
- `pnpm` 또는 `corepack`
- template constraint 통과 여부

## 해석 규칙

- 구조 검증이 깨지면 init 전에 중단한다.
- `pnpm`이 없고 `corepack`만 있으면 corepack 경로를 우선 사용한다.
- 사용자 글로벌 스킬과 충돌할 수 있는 이름은 새로 만들지 않는다.

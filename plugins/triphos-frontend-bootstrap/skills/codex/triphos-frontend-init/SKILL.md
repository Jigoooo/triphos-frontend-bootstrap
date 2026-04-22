---
name: triphos-frontend-init
description: 새 디렉터리에 React 19, React Compiler, TanStack Router/Query/Virtual, Zustand, Vitest, Framer Motion, `@jigoooo/api-client`, Pretendard, Triphos FSD 스켈레톤이 포함된 Triphos 프론트엔드 앱을 생성한다. 새 프로젝트를 부트스트랩하거나 표준 프론트엔드 스택 초기화를 요청받았을 때 사용한다.
---

# triphos-frontend-init

새 디렉터리 또는 허용된 런타임 상태물만 남아 있는 디렉터리를 스캐폴딩할 때만 이 스킬을 사용한다.

## 언어 규칙

- 사용자에게 보여주는 설명, 진행 보고, 계획, 검증 요약은 기본적으로 한국어로 작성한다.
- 코드, 명령어, 패키지명, 파일 경로는 원문을 유지한다.
- 한국어 문장에는 한글과 필요한 영문 코드 토큰만 사용한다. 다른 문자 체계나 깨진 인코딩처럼 보이는 문자를 섞지 않는다.
- 사용자가 다른 언어를 명시하면 그 요청을 따른다.

## 먼저 읽기

- [../../../references/shared/stack.md](../../../references/shared/stack.md)
- [../../../references/shared/init-contract.md](../../../references/shared/init-contract.md)
- [../../../references/shared/latest-stack.md](../../../references/shared/latest-stack.md)
- [../../../references/internal/frontend-doctor.md](../../../references/internal/frontend-doctor.md)

## 워크플로우

1. 레포 또는 머신 상태가 불명확하면 내부 doctor 가이드를 따라 `validate-plugin-structure.mjs`와 `doctor.mjs`를 먼저 실행한다.
2. 설치 캐시보다 현재 체크아웃된 플러그인 원본 저장소가 더 신뢰할 수 있으면, 현재 저장소의 `scripts/`와 `plugins/triphos-frontend-bootstrap/`를 source of truth로 삼아 설명한다.
3. 대상 디렉터리가 새 디렉터리이거나, `.omx`, `.omc`, `.codex`, `.claude`, `.agents`, `.cursor`, `.vscode`, `.idea`, `.zed`, `.git`, `.DS_Store`, `Thumbs.db` 같은 허용된 런타임/워크스페이스 상태물만 포함하는지 확인한다.
4. 허용되지 않은 엔트리가 있으면 우회하지 말고, 어떤 엔트리가 스캐폴드를 막는지 한국어로 짧게 설명한다.
5. doctor나 캐시 fallback을 설명할 때는 경로를 그대로 인용하고, 설명 문장은 짧은 한국어 평서문으로 유지한다.
6. 다음 스캐폴드 스크립트를 실행한다.

```bash
node ../../../scripts/scaffold-app.mjs --target <directory> --name <package-name> --install
```

7. 1차 검증은 `pnpm typecheck` 또는 `pnpm build`를 우선 사용한다.

## 템플릿 규칙

- 기본 베이스는 번들된 `templates/app/` 출력물을 그대로 복사한다.
- `src/shared/constants/`, `src/shared/adapter/`, `src/shared/hooks/`, `src/shared/lib/dev/`, `src/shared/lib/formatter/`, `src/shared/types/`, `src/shared/theme/`, `src/shared/ui/` starter kit, `src/app/declare/`, `public/robots.txt`, `AGENTS.md`, `CLAUDE.md`를 포함한다.
- Pretendard 폰트 asset과 복사된 전역 `index.css`를 유지한다.
- UI 스타일링은 inline `style` props를 기본으로 한다.
- `className`은 scrollbar helper 같은 정말 불가피한 utility hook 외에는 금지로 취급한다.
- 생성되는 API bootstrap은 최소 범위로 유지하고, 더 깊은 API 작업은 `triphos-api-client-setup`으로 넘긴다.
- 더 깊은 테마 작업은 `triphos-theme-setup`으로 연결한다.
- starter UI 검증용 `/starter` showcase route를 생성하고 연결한다.

## 최신 스택 기준

- 템플릿은 Vite 8 / Rolldown 시대 가정을 기준으로 유지한다.
- 흐름을 실제로 개선할 때만 React 19 훅(`useEffectEvent`, `useOptimistic`, `useActionState`)을 우선 검토한다.
- TypeScript는 6.0 기준선을 유지하고 strict optional/indexed-access checks를 켠다.
- Browser Mode는 테스트 확장 경로로 유지하되, 모든 생성 앱의 필수 요구사항으로 강제하지는 않는다.

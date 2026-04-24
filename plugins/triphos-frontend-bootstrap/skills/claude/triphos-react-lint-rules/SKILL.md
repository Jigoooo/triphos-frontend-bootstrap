---
name: triphos-react-lint-rules
description: React 19 + React Compiler + Triphos 프론트엔드 규칙을 적용한다. 훅 lint 수정, React Compiler 정리, inline style 강제, className 예외 판단, useMemo/useCallback 제거, useEffectEvent/useTransition 도입 판단 시 사용한다.
---

# triphos-react-lint-rules

## 핵심 규칙

- 일반 스타일링은 inline `style` props를 사용한다.
- `className`은 overlay scrollbar 같은 좁은 utility case 외에는 금지다.
- `useMemo`, `useCallback`은 기본적으로 제거한다. 외부 라이브러리가 안정 참조를 강제할 때만 예외를 둔다.
- `useEffect` 안의 직접 `setState` 패턴은 피하고, 구조를 다시 설계하거나 안전한 비동기/이벤트 경계로 옮긴다.
- `useEffectEvent`, `useTransition`, `useOptimistic`, `useActionState`는 실제 흐름 개선이 있을 때 우선 검토한다.
- lint만 통과하면 끝이 아니라 `verify:react-rules`까지 통과해야 한다.

## 워크플로우

1. 변경 전 `src/` 전체에서 `className`, `useMemo(`, `useCallback(`, `forwardRef`, `eslint-disable react-hooks/`, `useEffect(`를 스캔한다.
2. 각 후보를 `fix`, `defer`, `pass` 중 하나로 분류한다. 예외를 `pass`로 둘 때는 overlay scrollbar 같은 허용 사유를 적는다.
3. React Compiler 환경에서는 성능 최적화 목적의 `useMemo`/`useCallback`을 먼저 제거하고, 외부 라이브러리 stable reference 요구가 있을 때만 남긴다.
4. `useEffect` 안의 동기 `setState`는 렌더 중 파생값, 이벤트 경계, async boundary, `useEffectEvent` 중 맞는 구조로 옮긴다.
5. 변경 후 `pnpm verify:react-rules`, `pnpm lint`, `pnpm typecheck`를 실행한다.

## 누락 방지 게이트

- 사용자가 특정 파일만 요청했더라도 해당 파일이 import하는 local hook/component까지 함께 스캔한다.
- `triphos-fsd-refactor`와 함께 실행 중이면 분리된 새 파일도 다시 스캔한다.
- verifier가 없는 프로젝트에서는 같은 패턴을 `rg`로 대체 스캔하고 결과를 final report에 남긴다.

## 적용 맥락

- `triphos-fsd-refactor`와 함께 사용할 수 있다.
- 템플릿과 adopt baseline은 이 규칙을 hard verification의 일부로 사용한다.

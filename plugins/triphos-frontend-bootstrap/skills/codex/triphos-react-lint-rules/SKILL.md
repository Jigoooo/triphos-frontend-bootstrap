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

## 적용 맥락

- `triphos-fsd-refactor`와 함께 사용할 수 있다.
- 템플릿과 adopt baseline은 이 규칙을 hard verification의 일부로 사용한다.

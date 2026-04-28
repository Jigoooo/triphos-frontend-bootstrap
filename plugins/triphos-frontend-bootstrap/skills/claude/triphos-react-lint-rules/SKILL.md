---
name: triphos-react-lint-rules
description: React 19 + React Compiler + Triphos 프론트엔드 규칙을 적용한다. 훅 lint 수정, React Compiler 정리, inline style 강제, className 예외 판단, useMemo/useCallback 제거, useEffectEvent/useTransition 도입 판단 시 사용한다.
level: 2
triggers: ["react lint", "useMemo 제거", "useCallback 제거", "useEffect setState", "react-hooks 규칙", "React Compiler", "useEffectEvent", "useTransition", "inline style 강제"]
model: haiku
---

# triphos-react-lint-rules

> **모델 권장**: 이 작업은 단일 호출 패턴이라 가벼운 모델이면 충분하다. Claude는 frontmatter `model: haiku`로 자동 다운그레이드되고, Codex는 `/model gpt-5.4-mini`로 전환하면 비용을 절감할 수 있다.

<Purpose>
React 19 + React Compiler 환경의 훅/스타일링 규칙을 적용한다. 훅 lint 수정, React Compiler 정리, inline style 강제, className 예외 판단, useMemo/useCallback 제거, useEffectEvent/useTransition 도입 판단을 단일 패스로 수행한다.
</Purpose>

<Use_When>
- 사용자가 "react-hooks lint 에러", "useEffect setState 경고", "react-hooks 규칙 위반", "컴포넌트 최적화", "useMemo/useCallback 제거"를 언급
- React Compiler 환경에서 수동 메모이제이션을 정리하려 할 때
- inline style을 className으로 바꾸려 하거나 그 반대 결정을 내릴 때
- `triphos-fsd-refactor`가 훅 추출/컴포넌트 분리를 진행하면서 훅 내부 패턴 교정도 필요할 때
</Use_When>

<Do_Not_Use_When>
- 새 프로젝트 스캐폴드 → `triphos-frontend-init`
- 레이어 재구성/슈퍼 컴포넌트 분리 → `triphos-fsd-refactor`
- API/엔티티 작업 → `triphos-api-client-setup`
- 테마 토큰 작업 → `triphos-theme-setup`
</Do_Not_Use_When>

<Why_This_Exists>
React Compiler 환경에서 수동 `useMemo`/`useCallback`은 노이즈가 되고, `useEffect` 안의 동기 `setState`는 렌더 cascade를 일으킨다. 이 규칙들은 lint만 통과하는 방식으로 적당히 끄면 다시 자라난다. 이 스킬은 변경마다 같은 단일 패스를 적용해 변종을 막는다.
</Why_This_Exists>

<Inputs>
- 대상 파일/디렉터리 (선택, 미지정 시 `src/` 전체 스캔)
- `verify:react-rules`가 있는 프로젝트라면 그 결과를 우선 사용
</Inputs>

## 핵심 규칙

- 일반 스타일링은 inline `style` props를 사용한다.
- `className`은 overlay scrollbar 같은 좁은 utility case 외에는 금지다.
- `useMemo`, `useCallback`은 기본적으로 제거한다. 외부 라이브러리가 안정 참조를 강제할 때만 예외를 둔다.
- `useEffect` 안의 직접 `setState` 패턴은 피하고, 구조를 다시 설계하거나 안전한 비동기/이벤트 경계로 옮긴다.
- `useEffectEvent`, `useTransition`, `useOptimistic`, `useActionState`는 실제 흐름 개선이 있을 때 우선 검토한다.
- lint만 통과하면 끝이 아니라 `verify:react-rules`까지 통과해야 한다.

<Steps>
1. 변경 전 `src/` 전체에서 `className`, `useMemo(`, `useCallback(`, `forwardRef`, `eslint-disable react-hooks/`, `useEffect(`를 스캔한다.
2. 각 후보를 `fix`, `defer`, `pass` 중 하나로 분류한다. 예외를 `pass`로 둘 때는 overlay scrollbar 같은 허용 사유를 적는다.
3. React Compiler 환경에서는 성능 최적화 목적의 `useMemo`/`useCallback`을 먼저 제거하고, 외부 라이브러리 stable reference 요구가 있을 때만 남긴다.
4. `useEffect` 안의 동기 `setState`는 렌더 중 파생값, 이벤트 경계, async boundary, `useEffectEvent` 중 맞는 구조로 옮긴다.
5. 변경 후 `pnpm verify:react-rules`, `pnpm lint`, `pnpm typecheck`를 실행한다.
</Steps>

<Tool_Usage>
- 스캔: `rg className`, `rg "useMemo\("`, `rg "useCallback\("`, `rg "useEffect\(.*setState"`, `rg "eslint-disable react-hooks/"`
- 검증: `pnpm verify:react-rules`, `pnpm lint`, `pnpm typecheck`
- React 19 신규 훅 reference: `useEffectEvent`, `useTransition`, `useOptimistic`, `useActionState` (필요 시 react.dev 참조)
</Tool_Usage>

<Escalation_And_Stop_Conditions>
- 사용자가 특정 파일만 요청했더라도 해당 파일이 import하는 local hook/component까지 함께 스캔한다.
- `triphos-fsd-refactor`와 함께 실행 중이면 분리된 새 파일도 다시 스캔한다.
- verifier가 없는 프로젝트에서는 같은 패턴을 `rg`로 대체 스캔하고 결과를 final report에 남긴다.
- `pass` 분류는 허용 사유를 명시하지 않으면 금지.
</Escalation_And_Stop_Conditions>

<Final_Checklist>
- [ ] `className`, `useMemo`, `useCallback`, `useEffect setState`, `eslint-disable react-hooks/` 후보 전수 분류 (fix/defer/pass)
- [ ] React Compiler 환경에서 불필요한 메모이제이션 제거
- [ ] `useEffect` 동기 setState 패턴 교정 또는 defer 사유 명시
- [ ] `pnpm verify:react-rules`, `pnpm lint`, `pnpm typecheck` 모두 통과 (또는 verifier 부재 시 대체 스캔 결과 보고)
- [ ] 템플릿/adopt baseline의 hard verification과 일치
</Final_Checklist>

## 적용 맥락

- `triphos-fsd-refactor`와 함께 사용할 수 있다.
- 템플릿과 adopt baseline은 이 규칙을 hard verification의 일부로 사용한다.

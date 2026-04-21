---
name: triphos-react-lint-rules
description: React 19 + React Compiler + Triphos styling rules. Use when the user asks for `react-lint-rules`, hook lint fixes, React Compiler cleanup, removing `useMemo` or `useCallback`, adopting `useEffectEvent`, `useOptimistic`, `useActionState`, or enforcing inline `style` props instead of `className`.
---

# triphos-react-lint-rules

## Baseline

- prefer `useEffectEvent` for effect-local callbacks that need the latest values
- consider `useOptimistic` for optimistic UI transitions
- consider `useActionState` for action-driven async form flows
- use `useTransition` for expensive non-urgent updates
- remove `useMemo` and `useCallback` unless a third-party API truly requires a stable reference

## Styling rule

- use inline `style` props for normal component styling
- do not use `className` for ordinary layout or visual styling
- allow `className` only for hard-to-express utility cases such as scrollbar hooks or externally-owned library selectors

## Motion rule

- `framer-motion` is available in the standard template
- use it for meaningful transitions, not constant decorative motion


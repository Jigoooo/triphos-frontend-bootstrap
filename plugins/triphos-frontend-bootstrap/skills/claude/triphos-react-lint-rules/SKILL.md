---
name: triphos-react-lint-rules
description: React 19 + React Compiler + Triphos styling rules. Use when the user asks for `react-lint-rules`, hook lint fixes, React Compiler cleanup, removing `useMemo` or `useCallback`, adopting `useEffectEvent`, `useOptimistic`, `useActionState`, or enforcing inline `style` props instead of `className`.
---

# triphos-react-lint-rules

## Baseline

- prefer `useEffectEvent` for effect-local latest-value callbacks
- consider `useOptimistic` for optimistic UI
- consider `useActionState` for action-driven async form flows
- use `useTransition` for expensive non-urgent updates
- remove `useMemo` and `useCallback` unless a stable reference is required by a library

## Styling

- use inline `style` props for normal component styling
- do not use `className` for ordinary styling
- allow `className` only for hard-to-express utility cases such as scrollbar hooks

## Motion

- `framer-motion` is part of the standard template
- use it for intentional transitions, not decorative churn


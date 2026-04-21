---
name: triphos-fsd-refactor
description: Triphos FSD refactor skill. Use when the user asks for `fsd-refactor`, FSD cleanup, slice placement, component splitting, hook extraction, or public API cleanup inside a Triphos frontend project. This is the plugin-local namespaced version to avoid conflicts with global skills.
---

# triphos-fsd-refactor

## Read first

- [../../../references/shared/stack.md](../../../references/shared/stack.md)
- [../../../references/shared/collision-policy.md](../../../references/shared/collision-policy.md)

## Core rules

- keep the FSD layers at `app`, `pages`, `widgets`, `features`, `entities`, `shared`
- prefer public API exports over deep imports
- keep API code under `entities/*/api` unless there is a deliberate documented exception
- route React Compiler hook cleanup to `triphos-react-lint-rules`
- route adapter/bootstrap work to `triphos-api-client-setup`

## UI rule

- default all component styling to inline `style` props
- treat `className` as banned unless a small global utility hook is truly unavoidable

## Escalation

If the rulebook itself looks stale, do not invent a new rule. Route the review to `triphos-fsd-skill-update`.


---
name: triphos-fsd-refactor
description: Triphos FSD refactor skill. Use when the user asks for `fsd-refactor`, FSD cleanup, slice placement, component splitting, hook extraction, or public API cleanup inside a Triphos frontend project. Plugin-local namespaced version.
argument-hint: "[file-or-directory]"
---

# triphos-fsd-refactor

## Rules

- keep `app`, `pages`, `widgets`, `features`, `entities`, `shared`
- prefer public APIs over deep imports
- keep API files under `entities/*/api`
- route hook cleanup to `triphos-react-lint-rules`
- route adapter work to `triphos-api-client-setup`

## UI rule

- inline `style` props by default
- `className` banned unless a utility hook is genuinely unavoidable

If the rulebook itself may be stale, route to `triphos-fsd-skill-update`.


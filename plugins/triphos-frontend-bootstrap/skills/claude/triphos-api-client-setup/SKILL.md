---
name: triphos-api-client-setup
description: Triphos API client setup for `@jigoooo/api-client`. Use when the user asks for `api-client-setup`, adapter bootstrap, entity API creation, or migration to the Triphos `initApi` and `apiWithAdapter` pattern.
argument-hint: "[init|add|migrate]"
---

# triphos-api-client-setup

## Modes

- `init`
- `add <entity>`
- `migrate <path>`

## Rules

- inspect the current project before editing
- keep bootstrap under `src/app/providers/`
- keep entity API files under `src/entities/*/api`
- expect the base template to already include `src/shared/adapter/`, `src/shared/lib/api/`, `src/shared/lib/dev/`, `src/shared/hooks/`, and `src/shared/theme/`
- treat `src/shared/lib/api/api-url.ts`, `src/shared/lib/dev/runtime-env.ts`, and `src/shared/lib/dev/mock-api-adapter.ts` as the default companions to `api-bootstrap.ts`
- `src/shared/hooks/` exists by default, but it is not the primary dependency surface for `api-bootstrap`
- show the intended edits before changing behavior

Use `triphos-fsd-refactor` for placement questions and `triphos-react-lint-rules` when hook patterns also change.

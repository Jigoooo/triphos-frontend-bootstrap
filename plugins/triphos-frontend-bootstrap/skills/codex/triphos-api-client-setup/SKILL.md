---
name: triphos-api-client-setup
description: Triphos API client setup for `@jigoooo/api-client`. Use when the user asks for `api-client-setup`, adapter bootstrap, entity API creation, or migration to the Triphos `initApi` and `apiWithAdapter` pattern.
---

# triphos-api-client-setup

## Read first

- [../../../references/shared/stack.md](../../../references/shared/stack.md)
- [../../../references/shared/init-contract.md](../../../references/shared/init-contract.md)
- [../../../references/shared/latest-stack.md](../../../references/shared/latest-stack.md)

## Modes

- `init`: bootstrap the shared API layer and app provider wiring
- `add <entity>`: add a new entity API file
- `migrate <path>`: migrate raw `fetch` or `axios` code

## Rules

- inspect the current project before editing
- keep bootstrap logic under `src/app/providers/`
- keep entity API files under `src/entities/*/api`
- expect the base template to already include `src/shared/adapter/`, `src/shared/lib/api/`, `src/shared/lib/dev/`, `src/shared/hooks/`, and `src/shared/theme/`
- treat `src/shared/lib/api/api-url.ts`, `src/shared/lib/dev/runtime-env.ts`, and `src/shared/lib/dev/mock-api-adapter.ts` as the default companions to `api-bootstrap.ts`
- `src/shared/hooks/` exists by default, but it is not the primary dependency surface for `api-bootstrap`
- plan the edits before changing code
- when in doubt about response shape or auth flow, stop and inspect more
- after the baseline bootstrap, ask the AI to align request and response shapes with the project's real API schema before considering the setup complete

## Companion skills

- use `triphos-fsd-refactor` for layer placement questions
- use `triphos-react-lint-rules` when the API work also changes hooks or async UI state

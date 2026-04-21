---
name: triphos-frontend-bootstrap
description: Triphos frontend plugin router. Use when the user wants to bootstrap or verify a Triphos frontend workspace, or mentions `fsd-refactor`, `react-lint-rules`, `api-client-setup`, `fsd-update`, or `fsd-skill-update` inside this plugin. Route work to `triphos-frontend-doctor`, `triphos-frontend-init`, or the bundled namespaced policy skills.
---

# triphos-frontend-bootstrap

Use this as the top-level router for the plugin.

## Read first

- [../../../references/shared/stack.md](../../../references/shared/stack.md)
- [../../../references/shared/collision-policy.md](../../../references/shared/collision-policy.md)
- [../../../references/shared/init-contract.md](../../../references/shared/init-contract.md)
- [../../../references/shared/latest-stack.md](../../../references/shared/latest-stack.md)

## Routing table

- Plugin install or environment verification:
  use `triphos-frontend-doctor`
- New project creation:
  use `triphos-frontend-init`
- Theme tokens, theme stores, or `src/shared/theme` setup:
  use `triphos-theme-setup`
- Starter UI kit or `/starter` showcase work:
  use `triphos-frontend-init` for baseline generation, then `triphos-theme-setup` for theme/token follow-up
- FSD structure cleanup or slice placement:
  use `triphos-fsd-refactor`
- React Compiler lint fixes or hook modernization:
  use `triphos-react-lint-rules`
- `@jigoooo/api-client` bootstrap or entity API work:
  use `triphos-api-client-setup`
- FSD rulebook drift review:
  use `triphos-fsd-skill-update`

## Alias policy

Treat these user phrases as aliases for the bundled namespaced skills:

- `fsd-refactor` -> `triphos-fsd-refactor`
- `react-lint-rules` -> `triphos-react-lint-rules`
- `api-client-setup` -> `triphos-api-client-setup`
- `fsd-update` -> `triphos-fsd-skill-update`
- `fsd-skill-update` -> `triphos-fsd-skill-update`

Do not overwrite or assume control of the user's global skills. This plugin owns only its namespaced copies.

## Language policy

- human-facing markdown may exist in Korean and English mirrors
- execution skills stay canonical per tool; do not duplicate skills by language

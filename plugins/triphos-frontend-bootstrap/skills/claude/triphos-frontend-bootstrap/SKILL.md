---
name: triphos-frontend-bootstrap
description: Triphos frontend plugin router. Use when bootstrapping or verifying a Triphos frontend workspace, or when the user mentions `fsd-refactor`, `react-lint-rules`, `api-client-setup`, `fsd-update`, or `fsd-skill-update` inside this plugin. Route work to `triphos-frontend-doctor`, `triphos-frontend-init`, or the bundled namespaced policy skills.
argument-hint: "[doctor|init|rules]"
---

# triphos-frontend-bootstrap

## Read first

- [../../../references/shared/stack.md](../../../references/shared/stack.md)
- [../../../references/shared/collision-policy.md](../../../references/shared/collision-policy.md)
- [../../../references/shared/init-contract.md](../../../references/shared/init-contract.md)

## Routing table

- plugin install verification -> `triphos-frontend-doctor`
- new project scaffold -> `triphos-frontend-init`
- theme tokens or `src/shared/theme` setup -> `triphos-theme-setup`
- FSD cleanup -> `triphos-fsd-refactor`
- React Compiler or styling rules -> `triphos-react-lint-rules`
- API client bootstrap -> `triphos-api-client-setup`
- FSD rulebook drift review -> `triphos-fsd-skill-update`

## Alias policy

- `fsd-refactor` -> `triphos-fsd-refactor`
- `react-lint-rules` -> `triphos-react-lint-rules`
- `api-client-setup` -> `triphos-api-client-setup`
- `fsd-update` -> `triphos-fsd-skill-update`
- `fsd-skill-update` -> `triphos-fsd-skill-update`

Do not overwrite or depend on the user's global skills.

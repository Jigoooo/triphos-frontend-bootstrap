[English](README.md) | [한국어](README.ko.md)

# triphos-frontend-bootstrap

Git-first dual plugin marketplace for Triphos frontend bootstrapping.

## Install

### Claude Code

```text
/plugin marketplace add https://github.com/Jigoooo/triphos-frontend-bootstrap
/plugin install triphos-frontend-bootstrap
```

### Codex

Use the local registration helper when testing from a checkout:

```bash
pnpm run register:codex
```

## Main surfaces

- `triphos-frontend-bootstrap`: route bootstrap tasks
- `triphos-frontend-doctor`: verify plugin structure and init prerequisites
- `triphos-frontend-init`: scaffold a new Triphos frontend app

## Included policy skills

- `triphos-fsd-refactor`
- `triphos-react-lint-rules`
- `triphos-api-client-setup`
- `triphos-fsd-skill-update`

Public aliases are preserved in descriptions:

- `fsd-refactor`
- `react-lint-rules`
- `api-client-setup`
- `fsd-update`
- `fsd-skill-update`

## Generated app baseline

Apps scaffolded by `triphos-frontend-init` include:

- `AGENTS.md` and `CLAUDE.md` guidance files
- `shared/theme`, `shared/constants`, `shared/types`, and starter `shared/ui`
- `/starter` showcase route for component and overlay validation
- inline-style-first UI rules with `className` blocked except narrow utility cases


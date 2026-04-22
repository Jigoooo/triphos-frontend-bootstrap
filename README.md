[English](README.md) | [한국어](README.ko.md)

# triphos-frontend-bootstrap

A Triphos frontend bootstrap tool for Claude Code and Codex.

## Install

```bash
npx @jigoooo/triphos-frontend-bootstrap@latest
```

After install:

- plugin setup
- global `tfb` install
- project bootstrap via `triphos-frontend-init`
- updates via `tfb update`
- cleanup via `tfb delete`

Supports:

- Claude Code
- Codex

## Main skill

- `triphos-frontend-init`
  Creates a new Triphos frontend project from the bundled template.
- `triphos-frontend-adopt`
  Aligns an existing frontend project to the same Triphos runtime, tooling, API, and verification baseline used by the template.

## Policy skills

- `triphos-fsd-refactor`
  Used for FSD cleanup, boundary repair, and moving code into the right slice or layer.
- `triphos-react-lint-rules`
  Used to align code with React 19, React Compiler, hooks, and linting conventions.
- `triphos-api-client-setup`
  Used after the baseline is in place when a project needs additional entity APIs, raw API migration, or deeper `@jigoooo/api-client` customization.
- `triphos-fsd-skill-update`
  Used when FSD-related skill rules or project application guidance need to be updated.

Project generation happens inside Claude/Codex through the `triphos-frontend-init` skill.

## Cleanup

```bash
tfb delete
```

This removes the installed Triphos plugin from Claude and Codex, deletes synced Codex skills, and cleans the Claude plugin cache and marketplace clone when no Triphos install remains.
It keeps the global `tfb` CLI installed.

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

## Runtime Activation

- Generated or adopted repositories carry tracked `.codex/config.toml`, `.codex/hooks.json`, and `.claude/settings.json`.
- Codex hooks depend on `codex_hooks = true` in `.codex/config.toml`.
- Claude uses project-level `.claude/settings.json`; `.claude/settings.local.json` overrides it locally when present.
- Policy files existing in a repo and runtime activation being effective are separate concerns. Use the doctor flow to verify both.

## Lifecycle Responsibilities

| Surface | Responsibility |
| --- | --- |
| install scripts | register plugin, sync marketplace/skills, report activation prerequisites |
| doctor | diagnose Codex activation, Claude settings precedence, and install health |
| hooks | run conditional stop-time verification only when relevant files changed |
| skills | scaffold/adopt baseline and align codebases |
| docs | record official runtime assumptions and operational recovery paths |

## Main skill

- `triphos-frontend-init`
  Creates a new Triphos frontend project from the bundled template. This is the default target for the strong Triphos harness.
- `triphos-frontend-adopt`
  Explicitly opts an existing frontend project into the same Triphos runtime, tooling, API, documentation, and verification baseline used by the template.

## Policy skills

- `triphos-fsd-refactor`
  Used for FSD cleanup, boundary repair, and moving code into the right slice or layer.
- `triphos-react-lint-rules`
  Used to align code with React 19, React Compiler, hooks, and linting conventions.
- `triphos-api-client-setup`
  Used after the baseline is in place when a project needs additional entity APIs, raw API migration, or deeper `@jigoooo/api-client` customization.

Project generation happens inside Claude/Codex through the `triphos-frontend-init` skill.
The strong harness is meant for generated repositories by default. Existing projects only get the same contract through an explicit `triphos-frontend-adopt` migration.
When the generated project is standalone, the init flow also initializes git and creates an initial commit after verification. When the project is created inside a parent repository, nested git bootstrap is skipped.

## Cleanup

```bash
tfb delete
```

This removes the installed Triphos plugin from Claude and Codex, deletes synced Codex skills, and cleans the Claude plugin cache and marketplace clone when no Triphos install remains.
It keeps the global `tfb` CLI installed.

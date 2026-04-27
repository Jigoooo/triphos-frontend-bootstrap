---
name: triphos-theme-setup
description: Triphos theme setup skill. Use when initializing or extending `src/shared/theme`, design tokens, color primitives, semantic color maps, or theme stores in a Triphos frontend project. This skill is also the theme companion for `triphos-frontend-init`.
model: haiku
argument-hint: "[theme-task]"
---

> **모델 권장**: 이 작업은 단일 호출 패턴이라 가벼운 모델이면 충분하다. Claude는 frontmatter `model: haiku`로 자동 다운그레이드되고, Codex는 `/model gpt-5.4-mini`로 전환하면 비용을 절감할 수 있다.

# triphos-theme-setup

## Read first

- [../../../references/shared/stack.md](../../../references/shared/stack.md)
- [../../../references/shared/init-contract.md](../../../references/shared/init-contract.md)
- [../../../references/shared/latest-stack.md](../../../references/shared/latest-stack.md)

## Responsibility

- keep the default `src/shared/theme/` skeleton present
- evolve color primitives and semantic tokens without breaking `useColors()`
- keep component styling inline while letting theme values flow through hooks and stores
- ensure starter UI components consume theme values through `useColors()`
- keep the `/starter` showcase aligned with the current theme contract

## Contract

- token definitions live under `src/shared/theme/model/`
- components consume theme values through `useColors()`
- global CSS stays limited to resets, font-face, and browser normalization
- theme work must not reintroduce broad `className` styling
- theme changes must remain compatible with the starter kit renderers and controls
- if theme tokens change, keep `AGENTS.md` and `CLAUDE.md` guidance aligned with the new contract

## Workflow

1. Inspect `src/shared/theme/`, `src/shared/theme/index.ts`, and direct consumers of `useColors()`.
2. If adding tokens, update primitives, semantic maps, hook/store exports, and starter UI usage together.
3. Search for hardcoded colors in changed UI files and either route them through theme tokens or record why they are local one-off values.
4. Keep styling inline; do not solve theme drift by adding broad CSS classes.
5. Run `pnpm verify:react-rules`, `pnpm typecheck`, and `pnpm verify:frontend` when available.

## No-skip gate

- Every changed token must have at least one consumer or a documented reason for being reserved.
- Every changed `useColors()` shape must be reflected in imports/exports and starter route usage.
- If `AGENTS.md` or `CLAUDE.md` mention theme contracts, update them when the contract changes.
- If verification is unavailable, report the substitute scans used for `className`, hardcoded colors, and missing exports.

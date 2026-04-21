---
name: triphos-theme-setup
description: Triphos theme setup skill. Use when initializing or extending `src/shared/theme`, design tokens, color primitives, semantic color maps, or theme stores in a Triphos frontend project. Theme companion for `triphos-frontend-init`.
argument-hint: "[theme-task]"
---

# triphos-theme-setup

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

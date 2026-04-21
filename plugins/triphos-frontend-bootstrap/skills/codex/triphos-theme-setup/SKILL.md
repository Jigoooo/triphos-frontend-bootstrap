---
name: triphos-theme-setup
description: Triphos theme setup skill. Use when initializing or extending `src/shared/theme`, design tokens, color primitives, semantic color maps, or theme stores in a Triphos frontend project. This skill is also the theme companion for `triphos-frontend-init`.
---

# triphos-theme-setup

## Read first

- [../../../references/shared/stack.md](../../../references/shared/stack.md)
- [../../../references/shared/init-contract.md](../../../references/shared/init-contract.md)

## Responsibility

- keep the default `src/shared/theme/` skeleton present
- evolve color primitives and semantic tokens without breaking `useColors()`
- keep component styling inline while letting theme values flow through hooks and stores

## Contract

- token definitions live under `src/shared/theme/model/`
- components consume theme values through `useColors()`
- global CSS stays limited to resets, font-face, and browser normalization
- theme work must not reintroduce broad `className` styling


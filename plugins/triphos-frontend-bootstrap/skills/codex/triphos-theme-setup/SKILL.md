---
name: triphos-theme-setup
description: Triphos theme setup skill. Use when initializing or extending `src/shared/theme`, design tokens, color primitives, semantic color maps, or theme stores in a Triphos frontend project. This skill is also the theme companion for `triphos-frontend-init`.
argument-hint: "[theme-task]"
level: 2
triggers: ["theme setup", "design tokens", "color primitives", "semantic colors", "useColors", "shared/theme", "테마 토큰"]
---

# triphos-theme-setup

> **모델 권장**: 이 작업은 단일 호출 패턴이라 가벼운 모델이면 충분하다. Claude는 frontmatter `model: haiku`로 자동 다운그레이드되고, Codex는 `/model gpt-5.4-mini`로 전환하면 비용을 절감할 수 있다.

<Purpose>
Maintain and extend the Triphos `src/shared/theme` baseline — color primitives, semantic color maps, theme stores, and `useColors()` consumers — without breaking inline styling discipline or the starter showcase.
</Purpose>

<Use_When>
- Initializing or extending `src/shared/theme` in a Triphos frontend project
- Adding/renaming design tokens, color primitives, or semantic color maps
- Adjusting `useColors()` shape or consumers
- Acting as the theme companion right after `triphos-frontend-init`
</Use_When>

<Do_Not_Use_When>
- Scaffolding a new project → `triphos-frontend-init`
- Aligning an existing project to baseline → `triphos-frontend-adopt`
- FSD layer reorganisation → `triphos-fsd-refactor`
- React hook / lint cleanup → `triphos-react-lint-rules`
</Do_Not_Use_When>

<Why_This_Exists>
Theme drift is silent: a hardcoded hex here, a `className` shortcut there, and the design system stops serving as a single source of truth. This skill enforces the rule that color/semantic decisions flow through `src/shared/theme` and `useColors()`, and that the starter showcase keeps reflecting the current contract.
</Why_This_Exists>

<Inputs>
- Optional task hint, e.g. `add-token`, `rename-semantic`, `migrate-className`
- Working tree of a Triphos-style frontend project with `src/shared/theme/`
</Inputs>

<Read_First>
- [stack.md](../../../references/shared/stack.md) — 스택 / 패키지 매니저 baseline
</Read_First>

분기 시점 lazy (`references/shared/` 아래):

- 토큰/테마 변경이 stack 결정과 묶일 때: `init-contract.md`
- 최신 stack 버전 확인이 필요할 때: `latest-stack.md`

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

<Steps>
1. Inspect `src/shared/theme/`, `src/shared/theme/index.ts`, and direct consumers of `useColors()`.
2. If adding tokens, update primitives, semantic maps, hook/store exports, and starter UI usage together.
3. Search for hardcoded colors in changed UI files and either route them through theme tokens or record why they are local one-off values.
4. Keep styling inline; do not solve theme drift by adding broad CSS classes.
5. Run `pnpm verify:react-rules`, `pnpm typecheck`, and `pnpm verify:frontend` when available.
</Steps>

<Tool_Usage>
- `rg "color: '#"`, `rg className`, `rg "useColors\("` for hardcoded color and className audits
- `pnpm verify:react-rules`, `pnpm typecheck`, `pnpm verify:frontend` for verification
- Update `AGENTS.md` / `CLAUDE.md` when the contract or `useColors()` shape changes
</Tool_Usage>

<Escalation_And_Stop_Conditions>
- Every changed token must have at least one consumer or a documented reason for being reserved.
- Every changed `useColors()` shape must be reflected in imports/exports and starter route usage.
- If `AGENTS.md` or `CLAUDE.md` mention theme contracts, update them when the contract changes.
- If verification is unavailable, report the substitute scans used for `className`, hardcoded colors, and missing exports.
</Escalation_And_Stop_Conditions>

<Final_Checklist>
- [ ] `src/shared/theme/` skeleton intact and `useColors()` consumers updated
- [ ] No new broad `className` usage introduced
- [ ] Hardcoded colors either tokenised or annotated as local one-offs
- [ ] Starter showcase still reflects the current theme contract
- [ ] `pnpm verify:react-rules`, `pnpm typecheck`, `pnpm verify:frontend` all green (or substitute scans documented)
</Final_Checklist>

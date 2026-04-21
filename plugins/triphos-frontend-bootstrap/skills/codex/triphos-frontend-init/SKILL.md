---
name: triphos-frontend-init
description: Create a new Triphos frontend app in a new directory with React 19, React Compiler, TanStack Router/Query/Virtual, Zustand, Vitest, Framer Motion, `@jigoooo/api-client`, Pretendard, and the Triphos FSD skeleton. Use when bootstrapping a new project or when the user asks to initialize the standard frontend stack.
---

# triphos-frontend-init

Use this skill only for new-directory scaffolding.

## Read first

- [../../../references/shared/stack.md](../../../references/shared/stack.md)
- [../../../references/shared/init-contract.md](../../../references/shared/init-contract.md)
- [../../../references/shared/latest-stack.md](../../../references/shared/latest-stack.md)

## Workflow

1. Validate the environment with `triphos-frontend-doctor` if the repo or machine state is unclear.
2. Confirm the target directory is new or empty.
3. Run the scaffold script:

```bash
node ../../../scripts/scaffold-app.mjs --target <directory> --name <package-name> --install
```

4. Prefer `pnpm typecheck` or `pnpm build` as the first verification pass.

## Template rules

- copy the bundled `templates/app/` output as the base
- include `src/shared/constants/`, `src/shared/adapter/`, `src/shared/hooks/`, `src/shared/lib/dev/`, `src/shared/lib/formatter/`, `src/shared/types/`, `src/shared/theme/`, `src/shared/ui/` starter kit, `src/app/declare/`, `public/robots.txt`, `AGENTS.md`, and `CLAUDE.md`
- keep Pretendard font assets and the copied global `index.css`
- default UI styling to inline `style` props
- treat `className` as banned except for truly unavoidable utility hooks such as scrollbar helpers
- keep generated API bootstrap minimal; deeper API work belongs to `triphos-api-client-setup`
- route deeper theme work to `triphos-theme-setup`
- create and wire the `/starter` showcase route for starter UI verification

## Latest-tech posture

- keep the template aligned with Vite 8 / Rolldown-era assumptions
- prefer React 19 hooks such as `useEffectEvent`, `useOptimistic`, and `useActionState` where they genuinely improve the flow
- keep TypeScript on the 6.0 baseline with strict optional/indexed-access checks enabled
- keep Browser Mode as a testing upgrade path, not a mandatory requirement for every generated app

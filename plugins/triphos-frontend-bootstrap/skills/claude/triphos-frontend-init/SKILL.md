---
name: triphos-frontend-init
description: Create a new Triphos frontend app in a new directory with React 19, React Compiler, TanStack Router/Query/Virtual, Zustand, Vitest, Framer Motion, `@jigoooo/api-client`, Pretendard, and the Triphos FSD skeleton. Use when initializing the standard frontend stack.
argument-hint: "[target-directory]"
---

# triphos-frontend-init

## Read first

- [../../../references/shared/stack.md](../../../references/shared/stack.md)
- [../../../references/shared/init-contract.md](../../../references/shared/init-contract.md)
- [../../../references/shared/latest-stack.md](../../../references/shared/latest-stack.md)
- [../../../references/internal/frontend-doctor.md](../../../references/internal/frontend-doctor.md)

## Workflow

1. If the environment is unclear, follow the internal doctor guide and run `validate-plugin-structure.mjs` plus `doctor.mjs` first.
2. Ensure the target directory is new or empty.
3. Run:

```bash
node ../../../scripts/scaffold-app.mjs --target <directory> --name <package-name> --install
```

4. Verify with `pnpm typecheck` or `pnpm build`.

## Template rules

- include `src/shared/constants/`, `src/shared/adapter/`, `src/shared/hooks/`, `src/shared/lib/dev/`, `src/shared/lib/formatter/`, `src/shared/types/`, `src/shared/theme/`, `src/shared/ui/` starter kit, `src/app/declare/`, `public/robots.txt`, `AGENTS.md`, and `CLAUDE.md`
- copy Pretendard and the global `index.css` reset
- default UI code to inline `style` props
- ban `className` except for unavoidable utility hooks
- keep API bootstrap minimal; deeper API setup belongs to `triphos-api-client-setup`
- route deeper theme work to `triphos-theme-setup`
- create and wire the `/starter` showcase route for starter UI verification
- keep TypeScript on the 6.0 baseline with strict optional/indexed-access checks enabled

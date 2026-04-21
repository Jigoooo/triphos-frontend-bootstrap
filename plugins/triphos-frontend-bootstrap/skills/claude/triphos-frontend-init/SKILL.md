---
name: triphos-frontend-init
description: Create a new Triphos frontend app in a new directory with React 19, React Compiler, TanStack Router/Query/Virtual, Zustand, Vitest, Framer Motion, `@jigoooo/api-client`, Pretendard, and the Triphos FSD skeleton. Use when initializing the standard frontend stack.
argument-hint: "[target-directory]"
---

# triphos-frontend-init

## Read first

- [../../../references/shared/stack.md](../../../references/shared/stack.md)
- [../../../references/shared/init-contract.md](../../../references/shared/init-contract.md)

## Workflow

1. Run `triphos-frontend-doctor` if the environment is unclear.
2. Ensure the target directory is new or empty.
3. Run:

```bash
node ../../../scripts/scaffold-app.mjs --target <directory> --name <package-name> --install
```

4. Verify with `pnpm typecheck` or `pnpm build`.

## Template rules

- include `src/shared/adapter/`, `src/shared/hooks/`, `src/shared/lib/dev/`, `src/shared/theme/`, `src/app/declare/`, and `public/robots.txt`
- copy Pretendard and the global `index.css` reset
- default UI code to inline `style` props
- ban `className` except for unavoidable utility hooks
- keep API bootstrap minimal; deeper API setup belongs to `triphos-api-client-setup`
- route deeper theme work to `triphos-theme-setup`

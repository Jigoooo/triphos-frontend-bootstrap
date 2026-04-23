# Starter UI Polish And Demo Cleanup

## Goal

Polish the generated starter app so `/` and `/starter` feel intentional instead of placeholder-heavy while keeping the global rem base and inline-style-first contract intact.

## Scope

- Home route placeholder cards and CTA cleanup
- Starter route section restructuring and demo copy cleanup
- Shared UI polish for toast, loaders, select/multi-select, input focus, date picker, toggle button, switch, speed dial
- `useTimer` extension and new shared `Progress` primitive
- Verification script and visual baseline updates required by the route changes

## Ordered Work

1. Preserve current behavior evidence with pre-edit harness checks.
2. Update shared primitives and hooks in the template app.
3. Refactor `/` and `/starter` to consume the updated primitives and new layout.
4. Update harness assertions and refresh `/starter` visual baselines.
5. Run `pnpm verify:frontend` in the template app, then `pnpm verify:repo` at the repo root.

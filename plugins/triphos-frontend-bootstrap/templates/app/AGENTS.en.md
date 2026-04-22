# Triphos Frontend App Guidance

This app was generated from the Triphos frontend bootstrap.

Rules:

- Keep FSD layers at `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- Read `triphos-fsd-refactor` before making FSD structure or slice-boundary changes.
- Read `triphos-react-lint-rules` before making React hook, React Compiler, or styling-rule changes.
- Do not treat frontend work as complete until `pnpm verify:frontend` passes.
- Use inline `style` props by default.
- Do not use `className` except for tightly scoped utility hooks such as scrollbar-related cases.
- Use `shared/theme` and `useColors()` for theme-driven styling.
- Treat `shared/ui` as the approved starter surface. Validate new shared UI behavior in `/starter`.
- Keep API calls inside `src/shared/api/` and the `apiWithAdapter` baseline. Raw `fetch`, direct `axios`, and bare `api.get/post` returns are baseline violations.
- Manage query keys with `@lukemorales/query-key-factory`, and keep `query-keys.ts`, `query-options.ts`, and `mutation-options.ts` in entity `model/`.
- Features should pass entity wrappers directly to `useQuery` and `useMutation` instead of redefining query keys or mutation functions inline.
- Check official docs or MCP-backed references before changing React, Vite, TypeScript, or MCP-related setup.

# Triphos Frontend App Guidance

This app was generated from the Triphos frontend bootstrap.

Treat `docs/README.md` as the system of record for this repository.

Read first:

- `docs/product/README.md`
- `docs/architecture/README.md`
- `docs/quality/verification-matrix.md`
- `docs/plans/README.md`
- `docs/decisions/README.md`

Core rules:

- Keep FSD layers at `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- Read `triphos-fsd-refactor` before making FSD structure or slice-boundary changes.
- Read `triphos-react-lint-rules` before making React hook, React Compiler, or styling-rule changes.
- Read `triphos-api-client-setup` before adding APIs, migrating calls, or customizing auth/API bootstrap behavior.
- For non-trivial work, leave `PLAN.md`, `STATUS.md`, `DECISIONS.md`, and `VERIFICATION.md` inside `docs/plans/active/<date>-<slug>/`.
- Do not treat frontend work as complete until `pnpm verify:frontend` passes.
- Use inline `style` props by default.
- Do not use `className` except for tightly scoped utility hooks such as scrollbar-related cases.
- Use `shared/theme` and `useColors()` for theme-driven styling.
- Treat `shared/ui` as the approved starter surface. Validate new shared UI behavior in `/starter`.
- Keep browser-backed verification aligned with external DOM/screenshot checks over `/` and `/starter`, without app runtime instrumentation.
- Keep API calls inside `src/shared/api/` and the `apiWithAdapter` baseline. Raw `fetch`, direct `axios`, and bare `api.get/post` returns are baseline violations.
- When an API-related request comes in, inspect at least `src/shared/api/adapter/`, `src/shared/api/wrapper/api-with-adapter.ts`, and `src/app/providers/api-bootstrap.ts` before implementing so the existing baseline is extended rather than bypassed.
- Do not treat `VITE_API_URL=http://localhost`, `VITE_API_PORT=3001`, `VITE_SUFFIX_API_ENDPOINT=api`, or adapter fields such as `success/data/message/timestamp/error/statusCode` as the real backend contract. If the repo, backend docs, and user prompt do not define the actual contract, ask whether to keep or replace those template defaults before editing API code.
- Define runtime-validated contracts such as external input, API DTOs, form data, env values, and persisted state with `zod` schemas first, then derive types with `z.infer`. Plain TypeScript types are allowed for pure UI props and internal computation-only types.
- Manage query keys with `@lukemorales/query-key-factory`, and keep `query-keys.ts`, `query-options.ts`, and `mutation-options.ts` in entity `model/`.
- Features should pass entity wrappers directly to `useQuery` and `useMutation` instead of redefining query keys or mutation functions inline.
- Check official docs or MCP-backed references before changing React, Vite, TypeScript, or MCP-related setup.

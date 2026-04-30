# Triphos Frontend App Guidance For Claude

This app is the company frontend bootstrap baseline.

Treat `docs/README.md` as the system of record for this repository.

Read first:

- `docs/product/README.md`
- `docs/architecture/README.md`
- `docs/quality/verification-matrix.md`
- `docs/plans/README.md`
- `docs/decisions/README.md`

Defaults:

- preserve the FSD structure first
- read `triphos-fsd-refactor` before making FSD structure or slice-boundary changes
- read `triphos-react-lint-rules` before making React hook, React Compiler, or styling-rule changes
- read `triphos-api-client-setup` before adding APIs, migrating calls, or customizing auth/API bootstrap behavior
- for non-trivial work, leave `PLAN.md`, `STATUS.md`, `DECISIONS.md`, and `VERIFICATION.md` inside `docs/plans/active/<date>-<slug>/`
- do not treat frontend work as complete until `pnpm verify:frontend` passes
- use inline `style` props as the default styling surface
- treat `className` as effectively banned except for narrow utility cases such as scrollbar hooks
- consume theme only through `shared/theme` and `useColors()`
- use the `shared/ui` starter and `/starter` route as regression surfaces
- keep browser-backed verification aligned with external DOM/screenshot checks over `/` and `/starter`, without app runtime instrumentation
- keep API calls inside `src/shared/api/` and the `apiWithAdapter` baseline
- when an API-related request comes in, inspect at least `src/shared/api/adapter/`, `src/shared/api/wrapper/api-with-adapter.ts`, and `src/app/providers/api-bootstrap.ts` before implementing so the existing baseline is extended rather than bypassed
- do not treat `VITE_API_URL=http://localhost`, `VITE_API_PORT=3001`, `VITE_SUFFIX_API_ENDPOINT=api`, or adapter fields such as `success/data/message/timestamp/error/statusCode` as the real backend contract; if the repo, backend docs, and user prompt do not define the actual contract, ask whether to keep or replace those template defaults before editing API code
- define runtime-validated contracts such as external input, API DTOs, form data, env values, and persisted state with `zod` schemas first, then derive types with `z.infer`; plain TypeScript types are allowed for pure UI props and internal computation-only types
- manage query keys with `@lukemorales/query-key-factory`, and keep `query-keys.ts`, `query-options.ts`, and `mutation-options.ts` in entity `model/`
- features should pass entity wrappers directly to `useQuery` and `useMutation` instead of redefining query keys or mutation functions inline
- check official docs or MCP-backed references before changing React, Vite, TypeScript, or MCP setup

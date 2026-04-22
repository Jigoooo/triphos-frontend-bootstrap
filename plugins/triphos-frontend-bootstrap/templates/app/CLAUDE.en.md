# Triphos Frontend App Guidance For Claude

This app is the company frontend bootstrap baseline.

Defaults:

- preserve the FSD structure first
- read `triphos-fsd-refactor` before making FSD structure or slice-boundary changes
- read `triphos-react-lint-rules` before making React hook, React Compiler, or styling-rule changes
- do not treat frontend work as complete until `pnpm verify:frontend` passes
- use inline `style` props as the default styling surface
- treat `className` as effectively banned except for narrow utility cases such as scrollbar hooks
- consume theme only through `shared/theme` and `useColors()`
- use the `shared/ui` starter and `/starter` route as regression surfaces
- keep API calls inside `src/shared/api/` and the `apiWithAdapter` baseline
- manage query keys with `@lukemorales/query-key-factory`, and keep `query-keys.ts`, `query-options.ts`, and `mutation-options.ts` in entity `model/`
- features should pass entity wrappers directly to `useQuery` and `useMutation` instead of redefining query keys or mutation functions inline
- check official docs or MCP-backed references before changing React, Vite, TypeScript, or MCP setup

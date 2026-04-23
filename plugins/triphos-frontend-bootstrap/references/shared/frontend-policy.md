# Frontend Policy

- `triphos-fsd-refactor` semantics, `triphos-react-lint-rules` semantics, `eslint`, `typecheck`, and API baseline checks must pass together.
- `verify:frontend` is the mandatory stop-time verification entrypoint.
- `src/shared/api/` is the shared API baseline. `apiWithAdapter` is mandatory for entities API calls.
- API-related work must begin by inspecting the existing baseline in `src/shared/api/adapter/`, `src/shared/api/wrapper/api-with-adapter.ts`, and `src/app/providers/api-bootstrap.ts`.
- Template defaults such as `VITE_API_URL=http://localhost`, `VITE_API_PORT=3001`, `VITE_SUFFIX_API_ENDPOINT=api`, and example adapter fields are not authoritative backend contract data; when repo evidence, backend docs, and user input do not confirm the real contract, agents must ask before hardcoding or replacing them.
- Query keys must be managed with `@lukemorales/query-key-factory`.
- Entities keep API specs in `api/` and TanStack Query wrappers in `model/` (`query-keys.ts`, `query-options.ts`, `mutation-options.ts`).
- Features should pass those wrappers directly to `useQuery` and `useMutation` rather than redefining inline query keys or mutation functions.
- Generated apps must include project-local Codex and Claude runtime config so the policy travels with the repo.
- `className` is banned for ordinary styling. Only narrow utility cases such as overlay scrollbar handling are allowed.
- `useMemo` and `useCallback` are disallowed by default unless a third-party integration genuinely requires stable references.
- Essence-based directories inside slices such as `hooks/`, `types/`, `components/`, and `stores/` are forbidden.
- Auth-aware `api-bootstrap`, token store, and member store are part of the template baseline, not optional add-ons.

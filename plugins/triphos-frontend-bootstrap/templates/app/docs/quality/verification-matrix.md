# Verification Matrix

| Command | Scope | Guarantee |
| --- | --- | --- |
| `pnpm verify:fsd` | source structure | FSD naming and forbidden segment checks |
| `pnpm verify:react-rules` | source structure | inline-style-first and React rule contract |
| `pnpm verify:api` | source structure | shared API baseline and forbidden raw HTTP usage |
| `pnpm verify:plans` | workflow discipline | non-trivial changes in a git repo must update a complete plan bundle in `docs/plans/` |
| `pnpm lint` | source structure | ESLint compliance |
| `pnpm typecheck` | source structure | TypeScript integrity |
| `pnpm verify:e2e` | runtime | `/` and `/starter` boot and expose the expected baseline DOM surfaces |
| `pnpm verify:visual` | runtime | `/starter` desktop/mobile rendering stays within the tracked visual baseline |
| `pnpm verify:uat` | runtime | baseline user-facing route content remains intact on `/` and `/starter` |
| `pnpm capture:dom` | observability | exports a route DOM snapshot |
| `pnpm capture:screenshot` | observability | exports a route screenshot for a chosen viewport |

## Browser prerequisite

The browser-backed verification scripts use Chrome or Chromium in headless mode.

- Set `TRIPHOS_CHROME_BIN` if the binary is not discoverable on the current machine.
- The standard visual surface is `/starter`.

# Verification

## Manual

- Mobile `/starter` date-picker opens as a bottom sheet.
- Mobile `/starter` date-picker header interaction keeps the sheet open while changing calendar mode.
- Closing the picker no longer leaves the trigger focus ring after pointer interaction.

## Automated

- `pnpm lint` — PASS
- `pnpm typecheck` — PASS
- `pnpm verify:e2e` — PASS
- `pnpm verify:visual` — PASS
- `pnpm verify:repo` — PASS

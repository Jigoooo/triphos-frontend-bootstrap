# Architecture

## Canonical surfaces

- `AGENTS.md` and `CLAUDE.md` are the thin runtime entrypoints.
- `docs/` is the durable system of record.
- `src/` holds application code only. AI harness logic should not add runtime instrumentation to the app.
- `scripts/` holds repeatable verification, capture, and harness orchestration.

## External harness

- Browser-backed checks run outside the app and inspect rendered DOM and screenshots.
- `/` and `/starter` are the regression surfaces for generated baseline behavior.
- `.triphos/` holds temporary capture artifacts produced by the external scripts.

## Ownership boundaries

- FSD rules, React rules, and API baseline rules still apply.
- `docs/` should explain intent and current truth; it should not duplicate every code detail.
- Temporary verification artifacts live under `.triphos/` and are not part of the canonical record.

## Runtime contracts

- Define runtime contracts with `zod` schema first when data crosses an external or persisted boundary: API DTOs, form values, env-derived values, URL/search params, and persisted store snapshots.
- Derive the corresponding TypeScript type with `z.infer<typeof Schema>` so validation and static types stay tied together.
- Pure UI props and internal computation-only types may remain plain TypeScript types when no runtime validation boundary exists.

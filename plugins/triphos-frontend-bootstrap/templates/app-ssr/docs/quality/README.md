# Quality

This directory captures how the generated app proves correctness.

- `verification-matrix.md` maps each script to the guarantee it provides.
- `visual-baseline/` stores the tracked screenshots used by `pnpm verify:visual`.
- Runtime capture artifacts from verification commands are written to `.triphos/` instead of `docs/`.

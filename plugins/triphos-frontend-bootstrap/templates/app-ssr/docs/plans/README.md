# Plans

Use `docs/plans/` for non-trivial work. The goal is to preserve intent outside prompt history.

## Non-trivial by default

Create a plan when work changes:

- 3 or more repo-tracked files
- runtime hooks, verification scripts, routing, theme, API baseline, or shared UI
- architecture, docs, or migration behavior

## Required layout

Create `docs/plans/active/<date>-<slug>/` with:

- `PLAN.md` — target state and implementation steps
- `STATUS.md` — current progress and open blockers
- `DECISIONS.md` — resolved tradeoffs and rationale
- `VERIFICATION.md` — what was run and what passed/failed

Move completed work to `docs/plans/completed/<date>-<slug>/`.

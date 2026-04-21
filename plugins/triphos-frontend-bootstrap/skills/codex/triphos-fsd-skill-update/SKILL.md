---
name: triphos-fsd-skill-update
description: Triphos FSD rulebook audit. Use when the user asks for `fsd-update` or `fsd-skill-update`, or wants to compare the Triphos FSD rules with the latest official Feature-Sliced Design documentation. Manual review only; do not auto-apply rule changes.
---

# triphos-fsd-skill-update

This is the manual rulebook-audit surface.

## Alias policy

Treat both of these as the same request:

- `fsd-update`
- `fsd-skill-update`

## Workflow

1. Read the current local rulebook.
2. Compare it with the latest official FSD docs.
3. Classify the result as:
   - official change
   - conscious Triphos deviation
   - new official guidance
   - project-only quality rule
4. Report drift before editing anything.

Do not silently update the rulebook.


#!/usr/bin/env node

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext:
        'Triphos frontend policy is active. Treat docs/README.md as the system of record, create docs/plans/active/<date>-<slug>/PLAN.md plus STATUS.md/DECISIONS.md/VERIFICATION.md for non-trivial work, run pnpm verify:frontend before finishing frontend changes, and keep FSD, React lint, eslint, typecheck, API baseline, and query-key-factory/queryOptions/mutationOptions checks aligned.',
    },
  }),
);

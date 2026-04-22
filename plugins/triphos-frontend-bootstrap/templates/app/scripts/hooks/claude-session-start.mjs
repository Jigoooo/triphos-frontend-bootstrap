#!/usr/bin/env node

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext:
        'Triphos frontend policy is active. Run pnpm verify:frontend before finishing frontend changes, and keep FSD, React lint, eslint, typecheck, API baseline, and query-key-factory/queryOptions/mutationOptions checks aligned.',
    },
  }),
);

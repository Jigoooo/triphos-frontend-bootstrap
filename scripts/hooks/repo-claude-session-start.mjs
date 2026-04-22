#!/usr/bin/env node

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext:
        'Triphos plugin repository policy is active. Keep template, skills, references, and validation scripts aligned, and run pnpm verify:repo before finishing repository changes.',
    },
  }),
);

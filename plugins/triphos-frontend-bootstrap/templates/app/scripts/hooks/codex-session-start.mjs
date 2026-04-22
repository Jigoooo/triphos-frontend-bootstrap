#!/usr/bin/env node

const additionalContext = [
  'Triphos frontend policy is active in this repository.',
  'Before ending a task that touches frontend code, run pnpm verify:frontend.',
  'Apply the triphos-fsd-refactor contract, triphos-react-lint-rules contract, eslint, typecheck, API baseline rules, and query-key-factory/queryOptions/mutationOptions pattern together.',
].join(' ');

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext,
    },
  }),
);

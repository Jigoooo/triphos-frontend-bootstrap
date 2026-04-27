#!/usr/bin/env node

import { isTraceInjectEnabled, summarizeRecentFailures } from './trace-lib.mjs';

const policy =
  'Triphos plugin repository policy is active. Keep template, skills, references, and validation scripts aligned, and run pnpm verify:repo before finishing repository changes.';

let summary = '';
if (isTraceInjectEnabled()) {
  try {
    summary = summarizeRecentFailures(process.cwd(), 5);
  } catch {
    // Trace summarization must never break SessionStart context delivery.
  }
}

const additionalContext = summary ? `${policy}\n\n${summary}` : policy;

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext,
    },
  }),
);

# Skill token baseline

`measure-skill-tokens.mjs` produces a deterministic snapshot of the
approximate token cost of every Claude/Codex `SKILL.md` plus the
references each one links from its body.

## Token estimator

```js
estimatedTokens = Math.ceil(charCount / 4);
```

This is intentionally simple so the same input always produces the same
number, which makes baseline-vs-current diffs meaningful. It under-counts
real BPE tokenisation for code-dense markdown and over-counts for prose,
but the relative reduction across runs is the metric we care about.

## What is measured per skill

- `bodyLines`, `bodyChars` — SKILL.md body after frontmatter is stripped.
- `frontmatterChars` — included in the file but not in `bodyChars`.
- `refs[]` — every markdown link of the form `[label](relative.md)` whose
  target exists on disk. Each ref's char count is summed into
  `refsCharsImmediate`.
- `totalP50Tokens = estimatedBodyTokens` — approximates the median
  activation, which loads SKILL.md only.
- `totalP95Tokens = estimatedBodyTokens + estimatedRefsTokens` —
  approximates the worst-case activation, where every immediately-linked
  reference is read.

`median` and `p95` summary fields are taken across all
`(surface, skill)` pairs.

## Baseline workflow

```bash
# Snapshot current state.
node plugins/triphos-frontend-bootstrap/scripts/measure-skill-tokens.mjs --write auto

# After changes, assert relative improvement.
node plugins/triphos-frontend-bootstrap/scripts/measure-skill-tokens.mjs \
  --baseline .triphos/baselines/2026-04-28-skill-tokens.json \
  --assert-median 0.30 \
  --assert-p95 0.50
```

`--assert-median` and `--assert-p95` take a fraction (`0.30 = 30%`) and
exit non-zero if the reduction is below the threshold.

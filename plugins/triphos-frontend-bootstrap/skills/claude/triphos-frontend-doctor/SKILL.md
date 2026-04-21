---
name: triphos-frontend-doctor
description: Validate the Triphos frontend plugin and template health. Use when checking plugin manifests, marketplace metadata, skill paths, pnpm/corepack readiness, or before and after `triphos-frontend-init`.
argument-hint: "[--structure-only]"
---

# triphos-frontend-doctor

## Workflow

Run:

```bash
node ../../../scripts/validate-plugin-structure.mjs
node ../../../scripts/doctor.mjs
```

## Checks

- root Claude marketplace metadata
- root Codex marketplace metadata
- plugin-local manifests
- expected skill trees
- template files
- `pnpm` or `corepack` availability

Stop on missing structure before attempting init.


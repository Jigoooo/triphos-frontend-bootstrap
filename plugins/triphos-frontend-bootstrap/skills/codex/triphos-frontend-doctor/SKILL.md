---
name: triphos-frontend-doctor
description: Validate the Triphos frontend plugin and template health. Use when checking plugin manifests, marketplace metadata, skill paths, pnpm/corepack readiness, Vite 8-era prerequisites, or before and after running `triphos-frontend-init`.
---

# triphos-frontend-doctor

## Read first

- [../../../references/shared/stack.md](../../../references/shared/stack.md)
- [../../../references/shared/collision-policy.md](../../../references/shared/collision-policy.md)
- [../../../references/shared/init-contract.md](../../../references/shared/init-contract.md)

## Workflow

Run the structure validator first:

```bash
node ../../../scripts/validate-plugin-structure.mjs
```

Then run the broader doctor pass:

```bash
node ../../../scripts/doctor.mjs
```

## What doctor must verify

- root Claude marketplace metadata exists
- root Codex marketplace metadata exists
- plugin-local Claude and Codex manifests both exist
- both skill trees exist and contain the expected router skills
- template app files exist
- `pnpm` is available or `corepack` can activate it

## Interpretation rules

- if the plugin structure is broken, stop before init
- if `pnpm` is missing but `corepack` is available, prefer the scripted activation path
- if the user's global skills conflict by name, do not overwrite them; keep using the plugin-local `triphos-*` skill names

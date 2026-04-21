# Triphos Bootstrap Repo Guidance

This repository defines the company frontend bootstrap baseline.

Rules:

- Treat `plugins/triphos-frontend-bootstrap/templates/app/` as the source of truth for generated apps.
- Prefer preserving the starter scaffold contract over copying more reference-app code.
- Keep UI styling inline by default.
- Do not introduce broad `className` usage.
- Keep `shared/theme` and `useColors()` as the theme entrypoint.
- Keep namespaced plugin-local skills; do not reintroduce global skill collisions.
- Verify changes with structure checks and scaffold smoke tests before claiming completion.


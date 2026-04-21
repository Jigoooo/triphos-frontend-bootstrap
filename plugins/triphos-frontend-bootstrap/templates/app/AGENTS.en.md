# Triphos Frontend App Guidance

This app was generated from the Triphos frontend bootstrap.

Rules:

- Keep FSD layers at `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- Use inline `style` props by default.
- Do not use `className` except for tightly scoped utility hooks such as scrollbar-related cases.
- Use `shared/theme` and `useColors()` for theme-driven styling.
- Treat `shared/ui` as the approved starter surface. Validate new shared UI behavior in `/starter`.
- Keep API bootstrap and adapter work aligned with `@jigoooo/api-client` under the shared/app boundaries provided by the scaffold.
- Check official docs or MCP-backed references before changing React, Vite, TypeScript, or MCP-related setup.


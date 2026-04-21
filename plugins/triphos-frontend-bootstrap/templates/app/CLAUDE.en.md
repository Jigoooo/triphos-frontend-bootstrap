# Triphos Frontend App Guidance For Claude

This app is the company frontend bootstrap baseline.

Defaults:

- preserve the FSD structure first
- use inline `style` props as the default styling surface
- treat `className` as effectively banned except for narrow utility cases such as scrollbar hooks
- consume theme only through `shared/theme` and `useColors()`
- use the `shared/ui` starter and `/starter` route as regression surfaces
- keep `@jigoooo/api-client` structure inside the scaffolded shared/app boundaries
- check official docs or MCP-backed references before changing React, Vite, TypeScript, or MCP setup


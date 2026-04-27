# Triphos Latest Stack Reference

This file captures the approved official reference set for the bootstrap.

## Stable defaults

- React 19 + React Compiler
- Vite 8
- TanStack Router / Query / Virtual
- Zustand
- Vitest 4
- `@jigoooo/api-client`
- `@lukemorales/query-key-factory`
- `framer-motion`
- `@floating-ui/react`
- TypeScript 6.0

## Official references

- React
  - `useEffectEvent`: https://react.dev/reference/react/useEffectEvent
  - `useOptimistic`: https://react.dev/reference/react/useOptimistic
  - `useActionState`: https://react.dev/reference/react/useActionState
- Vite 8:
  - https://vite.dev/blog/announcing-vite8
- Vitest 4 Browser Mode:
  - https://vitest.dev/blog/vitest-4
  - https://vitest.dev/guide/browser/
- MCP TypeScript SDK:
  - https://ts.sdk.modelcontextprotocol.io/
  - https://modelcontextprotocol.io/docs/sdk
- Claude Code MCP:
  - https://docs.anthropic.com/en/docs/claude-code/mcp
- TypeScript 6.0:
  - https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
  - `exactOptionalPropertyTypes`: https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html
  - `noUncheckedIndexedAccess`: https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html

## SSR baseline

- TanStack Start (SSR + Nitro Node) is the official SSR template since 0.7.0. Use `triphos-frontend-init --template app-ssr` for the SSR baseline; the SPA template (`--template app`, default) keeps client-only TanStack Router + Vite without Start/Nitro.
  - https://tanstack.com/start/v1
  - https://tanstack.com/blog/announcing-tanstack-start-v1

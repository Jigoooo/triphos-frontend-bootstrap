# Triphos Stack

- React 19
- React Compiler
- TanStack Router
- TanStack Query
- TanStack Virtual
- Zustand
- Vitest
- `@jigoooo/api-client`
- `date-fns`
- `framer-motion`
- `lucide-react`
- `sonner`
- TypeScript
- `pnpm`

The reference implementation is `future-people-messenger-web`.
Use it as guidance for config shape, not as a requirement to copy every app feature.

Styling rules for the generated template:

- copy the reference app's `src/styles/index.css` reset and Pretendard font setup
- write component and layout styling with inline `style` props by default
- do not use `className` for normal component styling
- allow `className` only for truly unavoidable utility hooks such as a scrollbar helper
- keep CSS files for global resets, font-face, scrollbars, and browser normalization only

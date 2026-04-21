# Init Contract

- Create a new directory only.
- Ensure `pnpm` is available. If missing, try `corepack enable` and `corepack prepare pnpm@10.8.1 --activate`.
- Scaffold the standard Triphos stack from `templates/app/`.
- Replace the package name placeholder.
- Preserve `.gitkeep` files for empty FSD slices.
- Copy `public/fonts/PretendardVariable.woff2` into the generated app.
- Copy the reference `index.css` reset and font setup.
- Create `src/shared/adapter/`, `src/shared/lib/api/`, `src/shared/lib/dev/`, `src/shared/hooks/`, and `src/shared/theme/` by default.
- Copy `src/app/declare/global.d.ts` and `src/app/declare/svg.d.ts` into the template baseline.
- Copy `public/robots.txt` into the template baseline.
- Default new UI code to inline `style` props unless the style is truly global.
- Treat `className` as banned by default. Only allow it for hard-to-express global utility hooks such as scrollbar handling.
- After generation, prefer `pnpm install` then `pnpm build` or `pnpm typecheck`.

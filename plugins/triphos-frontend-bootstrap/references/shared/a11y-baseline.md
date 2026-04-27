# Accessibility Baseline (SSR template)

- `eslint-plugin-jsx-a11y` `flatConfigs.recommended` is the static lint baseline. Disabling rules is allowed only inside narrow file overrides with a comment explaining intent (e.g. starter demo surface).
- Runtime accessibility is verified by `@axe-core/playwright` via `pnpm verify:a11y`. The fail bar is **0 serious + 0 critical** violations on `/` and `/starter`. New pages must be added to the verifier's URL list when they ship.
- Lighthouse accessibility score must be `>= 0.95` (see `lighthouserc.json`). Anything below blocks the release path.
- All actionable elements (`button`, `a`, `[role="button"]`, etc.) must expose visible text or `aria-label`. Icon-only buttons require `aria-label`.
- `<img>` requires `alt`. Decorative images use `alt=""`. SVG with semantic meaning needs `<title>` plus `role="img"`.
- Form inputs must be associated with `<label htmlFor>` (or wrap the input in `<label>`). `aria-labelledby`/`aria-describedby` is acceptable when a visible label exists elsewhere.
- `aria-hidden="true"` elements must not contain focusable children; otherwise keyboard users can land on hidden content.
- Custom widgets must follow ARIA Authoring Practices: `role="button"` requires `tabIndex=0` plus `Enter`/`Space` key handlers; menus, dialogs, comboboxes follow their respective patterns.
- Color contrast must meet WCAG 2.1 AA (4.5:1 for body text, 3:1 for large text and UI components). All color choices flow through `useColors()` tokens; do not hardcode hex.
- `:focus-visible` outlines must remain visible. CSS resets that strip default focus styles must replace them with an equivalent indicator.
- Motion: respect `prefers-reduced-motion`. Long auto-playing animations are forbidden.
- When axe runtime flags `color-contrast`, fix tokens in `shared/theme` rather than overriding inline; fixes propagate to every consumer.

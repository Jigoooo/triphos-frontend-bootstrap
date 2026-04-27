# SEO Policy (SSR template only)

- Every public route must define `head: () => ({ meta, links, scripts })` and emit at least title + description through `buildMeta`.
- `buildMeta({ title, description, path, ogType?, ogImage?, twitterCard?, noIndex? })` is the canonical helper. It clamps title to 60 chars and description to 160 chars, fills the OG five-tuple (`og:type`/`og:title`/`og:description`/`og:image`/`og:url`), Twitter card (default `summary_large_image`), `og:site_name` + `og:locale` (default `ko_KR`), and a `<link rel="canonical">`.
- `noIndex: true` MUST suppress OG/Twitter/canonical and emit only `{ title, description, robots: 'noindex, nofollow' }` so social caches and external indexers do not retain noindex content.
- JSON-LD is mandated for `__root.tsx` (Organization + WebSite). Page routes pick the matching schema.org type via `jsonLdWebPage` (default), `jsonLdArticle` (blog/news), or `jsonLdBreadcrumbs` (deep navigation), wrapped with `jsonLdScript()`.
- `og:image` should be at least 1200x630. The default `/og-default.png` lives in `public/`; replace it for production deployments before launch.
- Sitemap entries belong in `src/routes/sitemap[.]xml.ts`'s `ENTRIES` array. Priority must stay within 0.0-1.0 (the helper clamps invalid values), `lastmod` must be ISO 8601 (`YYYY-MM-DD` or full ISO timestamp).
- robots.txt is served by the `src/routes/robots[.]txt.ts` file-based route so the `Sitemap:` line is always an absolute URL derived from `getBaseUrl()`. The static `public/robots.txt` is forbidden.
- `getBaseUrl()` reads `VITE_SITE_URL` from Node `process.env` first (Nitro runtime override) and falls back to `import.meta.env` (Vite build-time). For production deployments behind a CDN, set `VITE_SITE_URL` on the Node runtime.
- llms.txt (`src/routes/llms[.]txt.ts`) and llms-full.txt (`src/routes/llms-full[.]txt.ts`) follow the [llmstxt.org](https://llmstxt.org/) draft. The short variant lists primary pages; the full variant captures architecture, stack, and additional resources.
- Every SEO change is gated by `pnpm verify:seo` (head/meta/OG static heuristics) plus the SSR HTML check (`pnpm build && pnpm start && curl <path>`) before completion.
- Production Lighthouse SEO threshold is `>= 0.95` (see `lighthouserc.json`). Failures fall back to `triphos-seo-a11y-audit`.

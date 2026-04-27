import { createFileRoute } from '@tanstack/react-router';

import { buildSitemapXml, type SitemapEntry } from '@/shared/lib/seo';

const ENTRIES: SitemapEntry[] = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/starter', changefreq: 'monthly', priority: 0.6 },
];

export const Route = createFileRoute('/sitemap.xml')({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore TanStack Start augments server.handlers at runtime; @tanstack/react-router types do not include it
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().split('T')[0] ?? new Date().toISOString();
        const xml = buildSitemapXml(
          ENTRIES.map((entry) => {
            const next: SitemapEntry = { path: entry.path, lastmod: entry.lastmod ?? today };
            if (entry.changefreq) next.changefreq = entry.changefreq;
            if (typeof entry.priority === 'number') next.priority = entry.priority;
            return next;
          }),
        );
        return new Response(xml, {
          status: 200,
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      },
    },
  },
});

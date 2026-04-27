import { createFileRoute } from '@tanstack/react-router';

import { getBaseUrl } from '@/shared/lib/seo';

function buildRobotsTxt(): string {
  const base = getBaseUrl();
  return `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;
}

export const Route = createFileRoute('/robots.txt')({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore TanStack Start augments server.handlers at runtime; @tanstack/react-router types do not include it
  server: {
    handlers: {
      GET: async () => {
        return new Response(buildRobotsTxt(), {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      },
    },
  },
});

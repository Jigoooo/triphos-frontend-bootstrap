import { createFileRoute } from '@tanstack/react-router';

import { getBaseUrl, SITE_DESCRIPTION, SITE_NAME } from '@/shared/lib/seo';

function buildLlmsTxt(): string {
  const base = getBaseUrl();
  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

## Pages

- [Home](${base}/): 메인 페이지
- [Starter](${base}/starter): shared/ui 회귀 검증 라우트

## Notes

- 이 사이트는 Triphos frontend bootstrap (TanStack Start + Nitro) 베이스로 만들어졌습니다.
- 사이트맵: ${base}/sitemap.xml
- 전체본: ${base}/llms-full.txt
`;
}

export const Route = createFileRoute('/llms.txt')({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore TanStack Start augments server.handlers at runtime; @tanstack/react-router types do not include it
  server: {
    handlers: {
      GET: async () => {
        return new Response(buildLlmsTxt(), {
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

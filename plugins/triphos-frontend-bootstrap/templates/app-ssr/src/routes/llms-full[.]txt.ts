import { createFileRoute } from '@tanstack/react-router';

import { getBaseUrl, SITE_DESCRIPTION, SITE_NAME } from '@/shared/lib/seo';

function buildLlmsFullTxt(): string {
  const base = getBaseUrl();
  return `# ${SITE_NAME} — 전체 컨텍스트

> ${SITE_DESCRIPTION}

이 문서는 LLM(대규모 언어 모델) 친화적 풀 컨텍스트입니다. \`llms.txt\` 표준 초안의 확장본이며, 사이트의 모든 공개 페이지 요약을 한 파일에 담습니다.

## 사이트 구조

### Home — ${base}/

Triphos baseline 메인 페이지. 시작 화면이며 starter 라우트로 안내합니다.

### Starter — ${base}/starter

shared/ui starter surface. 폼/오버레이/로딩/피드백 컴포넌트의 회귀 검증 라우트입니다.

## 기술 스택

- 프레임워크: TanStack Start (SSR + Nitro Node 서버)
- 라우팅: TanStack Router (file-based)
- 스타일: inline style + useColors() 테마 토큰
- 상태/쿼리: React Query + zustand
- API 어댑터: @jigoooo/api-client + apiWithAdapter
- FSD 레이어: app/pages/widgets/features/entities/shared

## 추가 자원

- 사이트맵: ${base}/sitemap.xml
- 간단본: ${base}/llms.txt
- robots.txt: ${base}/robots.txt
`;
}

export const Route = createFileRoute('/llms-full.txt')({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore TanStack Start augments server.handlers at runtime; @tanstack/react-router types do not include it
  server: {
    handlers: {
      GET: async () => {
        return new Response(buildLlmsFullTxt(), {
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

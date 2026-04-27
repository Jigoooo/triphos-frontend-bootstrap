import { createFileRoute } from '@tanstack/react-router';

import { HomePage } from '@/pages/home';
import { buildMeta, jsonLdScript, jsonLdWebPage } from '@/shared/lib/seo';

export const Route = createFileRoute('/')({
  head: () => {
    const built = buildMeta({
      title: 'Triphos Home',
      description: 'Triphos frontend bootstrap baseline의 메인 페이지입니다.',
      path: '/',
    });
    return {
      meta: built.meta,
      links: built.links,
      scripts: [
        jsonLdScript(jsonLdWebPage({ name: 'Home', description: 'Triphos baseline 메인 페이지', path: '/' })),
      ],
    };
  },
  component: HomePage,
});

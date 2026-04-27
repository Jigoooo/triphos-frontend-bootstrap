import { createFileRoute } from '@tanstack/react-router';

import { StarterPage } from '@/pages/starter';
import { buildMeta, jsonLdScript, jsonLdWebPage } from '@/shared/lib/seo';

export const Route = createFileRoute('/starter')({
  head: () => {
    const built = buildMeta({
      title: 'Triphos Starter UI',
      description: 'Triphos shared/ui starter surface의 회귀 검증 라우트입니다.',
      path: '/starter',
    });
    return {
      meta: built.meta,
      links: built.links,
      scripts: [
        jsonLdScript(
          jsonLdWebPage({ name: 'Starter', description: 'Triphos starter surface', path: '/starter' }),
        ),
      ],
    };
  },
  component: StarterPage,
});

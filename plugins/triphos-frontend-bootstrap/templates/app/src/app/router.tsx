import { createRouter } from '@tanstack/react-router';

import { getQueryClient } from '@/app/providers/query-client';
import { routeTree } from '@/routeTree.gen';

export const router = createRouter({
  routeTree,
  context: {
    queryClient: getQueryClient(),
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

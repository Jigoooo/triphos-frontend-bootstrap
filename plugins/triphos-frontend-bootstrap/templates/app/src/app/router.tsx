import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';

import { getQueryClient } from '@/app/providers/query-client';
import { homePage } from '@/pages/home';

function RootComponent() {
  return (
    <div
      style={{
        minHeight: '100dvh',
      }}
    >
      <Outlet />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: homePage,
});

const routeTree = rootRoute.addChildren([indexRoute]);

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

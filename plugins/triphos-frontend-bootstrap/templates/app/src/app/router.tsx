import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';

import { getQueryClient } from '@/app/providers/query-client';
import { homePage } from '@/pages/home';
import { starterPage } from '@/pages/starter';
import { AlertDialogRenderer } from '@/shared/ui/alert-dialog';
import { BottomSheetRenderer } from '@/shared/ui/bottom-sheet';
import { ModalDialogRenderer } from '@/shared/ui/modal-dialog';
import { OverlayStackManager } from '@/shared/ui/overlay-stack';

function RootComponent() {
  return (
    <div
      style={{
        minHeight: '100dvh',
      }}
    >
      <Outlet />
      <OverlayStackManager />
      <AlertDialogRenderer />
      <ModalDialogRenderer />
      <BottomSheetRenderer />
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

const starterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/starter',
  component: starterPage,
});

const routeTree = rootRoute.addChildren([indexRoute, starterRoute]);

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

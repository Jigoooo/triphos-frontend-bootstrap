import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { useRef } from 'react';

import { getQueryClient } from '@/app/providers/query-client';
import { HomePage } from '@/pages/home';
import { StarterPage } from '@/pages/starter';
import { AlertDialogRenderer } from '@/shared/ui/alert-dialog';
import { BottomSheetRenderer } from '@/shared/ui/bottom-sheet';
import { ModalDialogRenderer } from '@/shared/ui/modal-dialog';
import { OverlayScrollbar } from '@/shared/ui/overlay-scrollbar';
import { OverlayStackManager } from '@/shared/ui/overlay-stack';

function RootComponent() {
  const rootScrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={rootScrollRef}
      data-overlay-scroll-root='true'
      style={{
        position: 'relative',
        minHeight: '100dvh',
        height: '100dvh',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <OverlayScrollbar containerRef={rootScrollRef} offset={{ top: 0, right: 0 }} />
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
  component: HomePage,
});

const starterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/starter',
  component: StarterPage,
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

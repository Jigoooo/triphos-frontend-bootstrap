/// <reference types="vite/client" />
import { type QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { bootstrapApi } from '@/app/providers/api-bootstrap';
import { initSystemThemeListener } from '@/shared/theme';
import { AlertDialogRenderer } from '@/shared/ui/alert-dialog';
import { BottomSheetRenderer } from '@/shared/ui/bottom-sheet';
import { ModalDialogRenderer } from '@/shared/ui/modal-dialog';
import { OverlayScrollbar } from '@/shared/ui/overlay-scrollbar';
import { OverlayStackManager } from '@/shared/ui/overlay-stack';
import { Toaster } from '@/shared/ui/toast';
import indexCssUrl from '@/styles/index.css?url';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Triphos Frontend App' },
      {
        name: 'description',
        content: 'Triphos frontend bootstrap baseline application.',
      },
    ],
    links: [{ rel: 'stylesheet', href: indexCssUrl }],
  }),
  component: RootComponent,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ko'>
      <head>
        <HeadContent />
      </head>
      <body>
        <div id='app'>{children}</div>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const rootScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bootstrapApi();
    initSystemThemeListener();
  }, []);

  return (
    <RootDocument>
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
        <Toaster />
      </div>
    </RootDocument>
  );
}

import type { AnyRouter } from '@tanstack/react-router';

let currentRouter: AnyRouter | null = null;

export function setAppRouter(router: AnyRouter) {
  currentRouter = router;
}

export function getAppRouter() {
  return currentRouter;
}


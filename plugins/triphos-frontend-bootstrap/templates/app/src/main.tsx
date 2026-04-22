import '@/styles/index.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';

import { bootstrapApi } from '@/app/providers/api-bootstrap';
import { getQueryClient } from '@/app/providers/query-client';
import { router } from '@/app/router';
import { initSystemThemeListener } from '@/shared/theme';
import { Toaster } from '@/shared/ui/toast';

bootstrapApi();
initSystemThemeListener();
const queryClient = getQueryClient();

const rootElement = document.getElementById('app')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>,
  );
}

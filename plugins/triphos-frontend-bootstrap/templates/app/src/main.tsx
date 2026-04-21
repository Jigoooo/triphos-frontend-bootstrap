import '@/styles/index.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';

import { bootstrapApi } from '@/app/providers/api-bootstrap';
import { router } from '@/app/router';
import { getQueryClient } from '@/app/providers/query-client';
import { initSystemThemeListener } from '@/shared/theme';

bootstrapApi();
initSystemThemeListener();
const queryClient = getQueryClient();

const rootElement = document.getElementById('app')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position='top-right' richColors />
    </QueryClientProvider>,
  );
}

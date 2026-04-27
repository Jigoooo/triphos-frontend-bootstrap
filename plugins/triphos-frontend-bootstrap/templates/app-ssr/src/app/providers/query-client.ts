import { QueryClient } from '@tanstack/react-query';

export function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        throwOnError: false,
        gcTime: 5 * 60_000,
      },
    },
  });
}


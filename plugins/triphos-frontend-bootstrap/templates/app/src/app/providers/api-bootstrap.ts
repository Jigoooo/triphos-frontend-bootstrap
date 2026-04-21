import { initApi } from '@jigoooo/api-client';

import { API_BASE_URL } from '@/shared/lib/api/api-url';
import { mockApiAdapter } from '@/shared/lib/dev/mock-api-adapter';
import { shouldUseDevMocks } from '@/shared/lib/dev/runtime-env';

export function bootstrapApi() {
  const useDevMocks = shouldUseDevMocks();

  initApi({
    baseURL: import.meta.env.DEV ? import.meta.env.VITE_API_PREFIX || '/api' : API_BASE_URL,
    axiosOptions: useDevMocks
      ? {
          adapter: mockApiAdapter,
        }
      : undefined,
    retryConfig: {
      maxRetries: 1,
      retryDelay: 0,
    },
  });
}

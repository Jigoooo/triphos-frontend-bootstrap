import { initApi } from '@jigoooo/api-client';

import { API_BASE_URL } from '@/shared/lib/api/api-url';

export function bootstrapApi() {
  initApi({
    baseURL: import.meta.env.DEV ? import.meta.env.VITE_API_PREFIX || '/api' : API_BASE_URL,
    retryConfig: {
      maxRetries: 1,
      retryDelay: 0,
    },
  });
}

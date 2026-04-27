import { initApi } from '@jigoooo/api-client';

import { tokenActions, authApi } from '@/entities/auth';
import { PUBLIC_AUTH_PATH } from '@/entities/auth/api/auth-api';
import { meActions } from '@/entities/member';
import { getApiBasePath, getProductionApiBaseUrl } from '@/shared/api';
import { isBrowser } from '@/shared/lib/is-browser';

export function bootstrapApi() {
  if (!isBrowser) return;

  const basePath = getApiBasePath();
  const baseURL = import.meta.env.DEV
    ? `${window.location.origin}${basePath}`
    : getProductionApiBaseUrl();

  initApi({
    baseURL,
    shouldSkipAuth: (config) => {
      const url = config.url;
      return url?.includes(PUBLIC_AUTH_PATH) ?? false;
    },
    getToken: () => {
      return tokenActions.getToken()?.accessToken ?? null;
    },
    refreshTokenFn: async () => {
      const currentToken = tokenActions.getToken();
      const refreshToken = currentToken?.refreshToken;

      if (!refreshToken) {
        throw new Error('Missing refresh token');
      }

      const response = await authApi.tokenRefresh({ refreshToken });

      if (!response.success || !response.data) {
        throw new Error('Failed to refresh token');
      }

      meActions.setMe(response.data.member);

      await tokenActions.setTokenAsync({
        accessToken: response.data.accessToken,
        refreshToken,
      });

      return response.data.accessToken;
    },
    transformRequest: 'snakeCase',
    transformResponse: 'camelCase',
    onUnauthorized: () => {
      meActions.reset();
      tokenActions.reset();
      if (isBrowser) {
        window.location.href = '/';
      }
    },
    retryConfig: {
      maxRetries: 1,
      retryDelay: 0,
      maxQueueSize: 50,
      shouldRetry: (error) => error.response?.status === 401,
    },
  });
}

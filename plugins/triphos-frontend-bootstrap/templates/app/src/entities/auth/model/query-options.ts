import { queryOptions } from '@tanstack/react-query';

import { authKeys } from './query-keys';
import { authApi } from '../api/auth-api';

export const authQueryOptions = {
  tokenCheck: () =>
    queryOptions({
      ...authKeys.tokenCheck,
      queryFn: async () => {
        const response = await authApi.tokenCheck();
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data ?? null;
      },
      staleTime: 0,
      gcTime: 0,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
};

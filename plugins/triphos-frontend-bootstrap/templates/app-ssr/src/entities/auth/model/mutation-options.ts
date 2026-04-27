import { mutationOptions, type QueryClient } from '@tanstack/react-query';

import type { LoginRequest, TokenRefreshRequest } from './auth-type';
import { authApi } from '../api/auth-api';

export const authMutationOptions = {
  login: () =>
    mutationOptions({
      mutationKey: ['auth', 'login'],
      mutationFn: (data: LoginRequest) => authApi.login(data),
    }),
  tokenRefresh: (queryClient?: QueryClient) =>
    mutationOptions({
      mutationKey: ['auth', 'refresh'],
      mutationFn: (data: TokenRefreshRequest) => authApi.tokenRefresh(data),
      onSuccess: () => {
        if (!queryClient) return;
        void queryClient.invalidateQueries({ queryKey: ['member'] });
      },
    }),
};

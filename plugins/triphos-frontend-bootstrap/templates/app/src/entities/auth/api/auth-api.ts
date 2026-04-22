import { api } from '@jigoooo/api-client';

import type { LoginRequest, LoginResponse, TokenRefreshRequest, TokenRefreshResponse } from '../model/auth-type';
import { apiWithAdapter } from '@/shared/api';

export const PUBLIC_AUTH_PATH = '/public/auth';
const AUTH_PATH = '/auth';

export const authApi = {
  tokenCheck: () => apiWithAdapter<null>(api.get(`${AUTH_PATH}/token/validate`)),
  tokenRefresh: (data: TokenRefreshRequest) =>
    apiWithAdapter<TokenRefreshResponse>(api.post(`${PUBLIC_AUTH_PATH}/refresh`, data)),
  login: (data: LoginRequest) =>
    apiWithAdapter<LoginResponse>(api.post(`${PUBLIC_AUTH_PATH}/login`, data)),
};

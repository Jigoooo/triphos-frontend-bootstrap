import type { Me } from '@/entities/member';

export type Token = {
  accessToken: string;
  refreshToken: string;
};

export type LoginRequest = {
  memberId: string;
  password: string;
};

export type TokenRefreshRequest = Pick<Token, 'refreshToken'>;

export type LoginResponse = Token & {
  member: Me;
  extraLoginAlertType?: string | null;
};

export type TokenRefreshResponse = Pick<Token, 'accessToken'> & {
  member: Me;
};

export type TokenState = {
  token: Token | null;
};

export type TokenStore = TokenState & {
  actions: {
    setToken: (token: Token) => void;
    setTokenAsync: (token: Token) => Promise<void>;
    getToken: () => Token | null;
    removeToken: () => void;
    reset: () => void;
  };
};

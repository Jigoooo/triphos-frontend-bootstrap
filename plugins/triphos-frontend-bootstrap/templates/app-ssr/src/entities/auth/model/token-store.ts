import { create } from 'zustand';
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware';

import type { Token, TokenState, TokenStore } from './auth-type';
import { isBrowser, noopStorage } from '@/shared/lib/is-browser';

const initialState: TokenState = {
  token: null,
};

export const useTokenStore = create<TokenStore>()(
  subscribeWithSelector(
    persist(
      (setState, getState) => ({
        ...initialState,
        actions: {
          setToken: (token: Token) => setState({ token }),
          setTokenAsync: async (token: Token) => {
            setState({ token });
            await useTokenStore.persist.rehydrate();
          },
          getToken: () => getState().token,
          removeToken: () => setState({ token: null }),
          reset: () => setState(initialState),
        },
      }),
      {
        name: 'token-storage',
        storage: createJSONStorage(() => (isBrowser ? localStorage : noopStorage)),
        partialize: (state) => ({
          token: state.token,
        }),
        version: 1,
        merge: (persistedState, currentState) => ({
          ...currentState,
          ...(persistedState as TokenState),
        }),
      },
    ),
  ),
);

export const tokenActions = useTokenStore.getState().actions;

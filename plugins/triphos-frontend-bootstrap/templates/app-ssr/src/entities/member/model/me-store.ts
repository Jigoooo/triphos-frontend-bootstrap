import { create } from 'zustand';

import type { Me, MeState, MeStore } from './me-type';

const initialState: MeState = {
  me: null,
};

export const useMeStore = create<MeStore>()((setState, getState) => ({
  ...initialState,
  actions: {
    setMe: (me: Me) => {
      setState((state) => ({
        ...state,
        me,
      }));
    },
    getMe: () => getState().me,
    reset: () => setState(initialState),
  },
}));

export const meActions = useMeStore.getState().actions;

import { create } from 'zustand';

import type { BottomSheetRender, BottomSheetState } from './types';

type BottomSheetStore = BottomSheetState & {
  actions: {
    open: (render: BottomSheetRender, resolve: (value: boolean) => void) => void;
    close: (value: boolean) => void;
  };
};

const initialState: BottomSheetState = {
  isOpen: false,
  render: null,
  resolve: null,
};

export const useBottomSheetStore = create<BottomSheetStore>()((setState, getState) => ({
  ...initialState,
  actions: {
    open: (render, resolve) => {
      const { resolve: previousResolve } = getState();
      previousResolve?.(false);
      setState({ isOpen: true, render, resolve });
    },
    close: (value) => {
      const { isOpen, resolve } = getState();
      if (!isOpen) return;
      setState(initialState);
      resolve?.(value);
    },
  },
}));

export const bottomSheetActions = useBottomSheetStore.getState().actions;


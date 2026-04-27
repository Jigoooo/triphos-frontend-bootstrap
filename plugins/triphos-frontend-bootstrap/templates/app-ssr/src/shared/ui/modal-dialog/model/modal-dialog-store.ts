import { create } from 'zustand';

import type { ModalDialogConfig, ModalDialogState } from './types';

export const useModalDialogStore = create<
  ModalDialogState & {
    actions: {
      open: (render: () => React.ReactNode, config: ModalDialogConfig, resolve: (value: boolean) => void) => void;
      close: (value: boolean) => void;
    };
  }
>((set) => ({
  isOpen: false,
  renderContent: null,
  closeOnBackdropClick: true,
  resolve: null,
  actions: {
    open: (render, config, resolve) => {
      const previousResolve = useModalDialogStore.getState().resolve;
      previousResolve?.(false);

      set({
        isOpen: true,
        renderContent: render,
        closeOnBackdropClick: config.closeOnBackdropClick !== false,
        resolve,
      });
    },
    close: (value) => {
      const state = useModalDialogStore.getState();
      if (!state.isOpen) return;

      set({
        isOpen: false,
        renderContent: null,
        closeOnBackdropClick: true,
        resolve: null,
      });

      state.resolve?.(value);
    },
  },
}));

export const modalDialogActions = useModalDialogStore.getState().actions;


import { create } from 'zustand';

import { AlertDialogMode, type AlertDialogConfig, type AlertDialogState } from './types';

type AlertDialogStore = AlertDialogState & {
  actions: {
    open: (mode: AlertDialogMode, config: AlertDialogConfig, resolve: (value: boolean) => void) => void;
    close: (value: boolean) => void;
  };
};

const initialState: AlertDialogState = {
  isOpen: false,
  mode: AlertDialogMode.Alert,
  config: null,
  resolve: null,
};

export const useAlertDialogStore = create<AlertDialogStore>()((setState, getState) => ({
  ...initialState,
  actions: {
    open: (mode, config, resolve) => {
      const { resolve: previousResolve } = getState();
      previousResolve?.(false);
      setState({ isOpen: true, mode, config, resolve });
    },
    close: (value) => {
      const { isOpen, resolve } = getState();
      if (!isOpen) return;
      setState(initialState);
      resolve?.(value);
    },
  },
}));

export const alertDialogActions = useAlertDialogStore.getState().actions;


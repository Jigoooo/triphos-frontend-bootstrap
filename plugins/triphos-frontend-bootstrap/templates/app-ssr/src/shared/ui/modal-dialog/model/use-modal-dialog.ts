import { modalDialogActions } from './modal-dialog-store';
import type { ModalDialogConfig } from './types';

export function useModalDialog() {
  return (render: () => React.ReactNode, config: ModalDialogConfig = {}) =>
    new Promise<boolean>((resolve) => {
      modalDialogActions.open(render, config, resolve);
    });
}


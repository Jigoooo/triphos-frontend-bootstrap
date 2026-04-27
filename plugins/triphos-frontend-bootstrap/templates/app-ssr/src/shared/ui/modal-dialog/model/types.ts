import type { ReactNode } from 'react';

export type ModalDialogConfig = {
  closeOnBackdropClick?: boolean;
};

export type ModalDialogState = {
  isOpen: boolean;
  renderContent: (() => ReactNode) | null;
  closeOnBackdropClick: boolean;
  resolve: ((value: boolean) => void) | null;
};


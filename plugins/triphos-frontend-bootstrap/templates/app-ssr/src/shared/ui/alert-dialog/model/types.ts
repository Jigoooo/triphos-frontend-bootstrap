export enum AlertDialogMode {
  Alert = 'alert',
  Confirm = 'confirm',
}

export enum AlertDialogType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

export type AlertDialogConfig = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  closeOnBackdropClick?: boolean;
  type: AlertDialogType;
};

export type AlertDialogState = {
  isOpen: boolean;
  mode: AlertDialogMode;
  config: AlertDialogConfig | null;
  resolve: ((value: boolean) => void) | null;
};


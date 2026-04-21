import { alertDialogActions } from '../model/alert-dialog-store';
import { AlertDialogMode, AlertDialogType, type AlertDialogConfig } from '../model/types';

export const alertDialog = {
  alert(config: Omit<AlertDialogConfig, 'type'> & { type?: AlertDialogType }) {
    return new Promise<boolean>((resolve) => {
      alertDialogActions.open(
        AlertDialogMode.Alert,
        {
          type: config.type ?? AlertDialogType.Info,
          ...config,
        },
        resolve,
      );
    });
  },
  confirm(config: Omit<AlertDialogConfig, 'type'> & { type?: AlertDialogType }) {
    return new Promise<boolean>((resolve) => {
      alertDialogActions.open(
        AlertDialogMode.Confirm,
        {
          type: config.type ?? AlertDialogType.Warning,
          ...config,
        },
        resolve,
      );
    });
  },
};


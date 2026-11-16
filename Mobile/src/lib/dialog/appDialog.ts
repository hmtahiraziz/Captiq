export type AppAlertOptions = {
  title: string;
  message: string;
  detail?: string;
  confirmLabel?: string;
};

export type AppConfirmOptions = {
  title: string;
  message: string;
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type DialogHandlers = {
  confirm: (options: AppConfirmOptions) => Promise<boolean>;
  alert: (options: AppAlertOptions) => Promise<void>;
};

let handlers: DialogHandlers | null = null;

export function bindAppDialog(next: DialogHandlers): void {
  handlers = next;
}

export function unbindAppDialog(): void {
  handlers = null;
}

/** Themed confirm dialog (works outside React components once provider is mounted). */
export function appConfirm(options: AppConfirmOptions): Promise<boolean> {
  if (!handlers) {
    return Promise.resolve(false);
  }
  return handlers.confirm(options);
}

/** Themed single-button alert (works outside React components once provider is mounted). */
export function appAlert(options: AppAlertOptions): Promise<void> {
  if (!handlers) {
    return Promise.resolve();
  }
  return handlers.alert(options);
}

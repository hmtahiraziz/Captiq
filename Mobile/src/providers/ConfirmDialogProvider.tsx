import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ConfirmDialog,
  type ConfirmDialogVariant,
} from '../components/ui/ConfirmDialog';
import {
  bindAppDialog,
  unbindAppDialog,
  type AppAlertOptions,
  type AppConfirmOptions,
} from '../lib/dialog/appDialog';

export type ConfirmDialogOptions = AppConfirmOptions;

interface ActiveDialog extends AppConfirmOptions {
  variant: ConfirmDialogVariant;
}

interface ConfirmDialogContextValue {
  confirm: (options: AppConfirmOptions) => Promise<boolean>;
  alert: (options: AppAlertOptions) => Promise<void>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ActiveDialog | null>(null);
  const resolveConfirmRef = useRef<((value: boolean) => void) | null>(null);
  const resolveAlertRef = useRef<(() => void) | null>(null);

  const closeConfirm = useCallback((result: boolean) => {
    resolveConfirmRef.current?.(result);
    resolveConfirmRef.current = null;
    setDialog(null);
  }, []);

  const closeAlert = useCallback(() => {
    resolveAlertRef.current?.();
    resolveAlertRef.current = null;
    setDialog(null);
  }, []);

  const confirm = useCallback((options: AppConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveAlertRef.current = null;
      resolveConfirmRef.current = resolve;
      setDialog({ ...options, variant: 'confirm' });
    });
  }, []);

  const alert = useCallback((options: AppAlertOptions) => {
    return new Promise<void>((resolve) => {
      resolveConfirmRef.current = null;
      resolveAlertRef.current = resolve;
      setDialog({
        title: options.title,
        message: options.message,
        detail: options.detail,
        confirmLabel: options.confirmLabel ?? 'OK',
        variant: 'alert',
      });
    });
  }, []);

  useEffect(() => {
    bindAppDialog({ confirm, alert });
    return () => unbindAppDialog();
  }, [confirm, alert]);

  const value = useMemo(() => ({ confirm, alert }), [confirm, alert]);

  const isAlert = dialog?.variant === 'alert';

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      <ConfirmDialog
        visible={dialog !== null}
        variant={dialog?.variant ?? 'confirm'}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        detail={dialog?.detail}
        confirmLabel={dialog?.confirmLabel}
        cancelLabel={dialog?.cancelLabel}
        destructive={dialog?.destructive}
        onCancel={() => (isAlert ? closeAlert() : closeConfirm(false))}
        onConfirm={() => (isAlert ? closeAlert() : closeConfirm(true))}
      />
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog(): ConfirmDialogContextValue {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  }

  return context;
}

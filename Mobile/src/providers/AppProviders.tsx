import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { appToastConfig, APP_TOAST_TOP_OFFSET } from '../components/ui/AppToast';
import { ConfirmDialogProvider } from './ConfirmDialogProvider';
import { ScanCacheHydrator } from './ScanCacheHydrator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ScanCacheHydrator />
          <ConfirmDialogProvider>
            {children}
          </ConfirmDialogProvider>
          <Toast
            config={appToastConfig}
            position="top"
            topOffset={APP_TOAST_TOP_OFFSET}
          />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

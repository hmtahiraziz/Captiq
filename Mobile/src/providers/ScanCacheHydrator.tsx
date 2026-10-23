import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { scanKeys } from '../hooks/useScans';
import { loadScanCache } from '../lib/storage/scanCache';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { useAuthStore } from '../stores/useAuthStore';

export function ScanCacheHydrator() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void loadScanCache().then((cached) => {
      if (cached?.items.length) {
        queryClient.setQueryData(scanKeys.list(), cached);
      }
    });

    void useFavoritesStore.getState().hydrate();
  }, [isAuthenticated, queryClient]);

  return null;
}

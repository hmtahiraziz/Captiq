import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Message, ScanListResponse } from '../types/api';
import { loadScanCache, saveScanCache } from '../lib/storage/scanCache';
import * as scansService from '../services/scans.service';
import { useScanListMeta } from '../stores/useScanListMeta';

export const scanKeys = {
  all: ['scans'] as const,
  list: () => [...scanKeys.all, 'list'] as const,
  detail: (id: string) => [...scanKeys.all, 'detail', id] as const,
  messages: (id: string) => [...scanKeys.all, 'messages', id] as const,
};

async function fetchScansWithCache(): Promise<ScanListResponse> {
  const { setOfflineFallback } = useScanListMeta.getState();

  try {
    const data = await scansService.getScans();
    await saveScanCache(data);
    setOfflineFallback(false);
    return data;
  } catch (error) {
    const cached = await loadScanCache();

    if (cached) {
      setOfflineFallback(true);
      return cached;
    }

    setOfflineFallback(false);
    throw error;
  }
}

export function useScans() {
  return useQuery({
    queryKey: scanKeys.list(),
    queryFn: fetchScansWithCache,
  });
}

export function useScan(scanId: string) {
  return useQuery({
    queryKey: scanKeys.detail(scanId),
    queryFn: () => scansService.getScanById(scanId),
    enabled: Boolean(scanId),
  });
}

export function useMessages(scanId: string) {
  return useQuery({
    queryKey: scanKeys.messages(scanId),
    queryFn: () => scansService.getMessages(scanId),
    enabled: Boolean(scanId),
  });
}

export function useCreateScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      imageUri,
      onProgress,
    }: {
      imageUri: string;
      onProgress?: Parameters<typeof scansService.createScan>[1];
    }) => scansService.createScan(imageUri, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scanKeys.list() });
    },
  });
}

export function useSendMessage(scanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => scansService.sendMessage(scanId, content),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: scanKeys.messages(scanId) });

      const previous = queryClient.getQueryData<Message[]>(scanKeys.messages(scanId));
      const optimisticUser: Message = {
        id: `optimistic-${Date.now()}`,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(scanKeys.messages(scanId), [
        ...(previous ?? []),
        optimisticUser,
      ]);

      return { previous };
    },
    onError: (_error, _content, context) => {
      if (context?.previous) {
        queryClient.setQueryData(scanKeys.messages(scanId), context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Message[]>(scanKeys.messages(scanId), (current) => {
        const withoutOptimistic = (current ?? []).filter(
          (message) => !message.id.startsWith('optimistic-'),
        );

        return [
          ...withoutOptimistic,
          data.userMessage,
          data.assistantMessage,
        ];
      });
    },
  });
}

export function useDeleteScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scanId: string) => scansService.deleteScan(scanId),
    onMutate: async (scanId) => {
      await queryClient.cancelQueries({ queryKey: scanKeys.list() });

      const previous = queryClient.getQueryData<ScanListResponse>(scanKeys.list());

      if (previous) {
        const next: ScanListResponse = {
          ...previous,
          items: previous.items.filter((item) => item.id !== scanId),
        };

        queryClient.setQueryData<ScanListResponse>(scanKeys.list(), next);
        await saveScanCache(next);
      }

      queryClient.removeQueries({ queryKey: scanKeys.detail(scanId) });
      queryClient.removeQueries({ queryKey: scanKeys.messages(scanId) });

      return { previous };
    },
    onError: (_error, _scanId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(scanKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: scanKeys.list() });
    },
  });
}

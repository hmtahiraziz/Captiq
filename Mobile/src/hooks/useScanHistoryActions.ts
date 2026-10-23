import { useCallback, useState } from 'react';
import { showAppToast } from '../lib/toast/showAppToast';
import { useConfirmDialog } from '../providers/ConfirmDialogProvider';
import { formatAiText } from '../lib/format/aiText';
import { formatModelLabel } from '../lib/format/model';
import { scanKeys, useDeleteScan, useScans } from './useScans';
import { getApiErrorMessage } from '../services/api/client';
import * as scansService from '../services/scans.service';
import type { Scan } from '../types/api';
import { useQueryClient } from '@tanstack/react-query';

function buildScanPreview(caption: string): string {
  const formatted = formatAiText(caption);

  if (formatted.length <= 120) {
    return formatted;
  }

  return `${formatted.slice(0, 117).trimEnd()}...`;
}

export function useScanHistoryActions() {
  const queryClient = useQueryClient();
  const { confirm } = useConfirmDialog();
  const { data } = useScans();
  const deleteScanMutation = useDeleteScan();
  const [isClearingAll, setIsClearingAll] = useState(false);

  const totalCount = data?.items.length ?? 0;
  const deletingScanId =
    deleteScanMutation.isPending && deleteScanMutation.variables
      ? deleteScanMutation.variables
      : null;

  const requestDeleteScan = useCallback(
    async (scan: Scan) => {
      const confirmed = await confirm({
        title: 'Delete scan?',
        message: 'This scan will be permanently removed from your history.',
        detail: `${buildScanPreview(scan.caption)}\n\nModel: ${formatModelLabel(scan.model)}`,
        confirmLabel: 'Delete',
        cancelLabel: 'Keep scan',
        destructive: true,
      });

      if (!confirmed) {
        return;
      }

      deleteScanMutation.mutate(scan.id, {
        onError: (error) => {
          showAppToast('error', getApiErrorMessage(error));
        },
      });
    },
    [confirm, deleteScanMutation],
  );

  const clearAllScans = useCallback(async () => {
    const scans = data?.items ?? [];

    if (scans.length === 0) {
      showAppToast('info', 'No scan history to clear');
      return;
    }

    setIsClearingAll(true);

    try {
      await Promise.all(scans.map((item) => scansService.deleteScan(item.id)));
      await queryClient.invalidateQueries({ queryKey: scanKeys.list() });
      showAppToast('success', 'Scan history cleared');
    } catch (error) {
      showAppToast('error', getApiErrorMessage(error));
    } finally {
      setIsClearingAll(false);
    }
  }, [data?.items, queryClient]);

  const requestClearAllScans = useCallback(async () => {
    if (totalCount === 0 || isClearingAll || deleteScanMutation.isPending) {
      return;
    }

    const confirmed = await confirm({
      title: 'Clear all history?',
      message: `This permanently deletes all ${totalCount} scan${totalCount === 1 ? '' : 's'}. This cannot be undone.`,
      confirmLabel: 'Clear all',
      cancelLabel: 'Cancel',
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    await clearAllScans();
  }, [clearAllScans, confirm, deleteScanMutation.isPending, isClearingAll, totalCount]);

  return {
    totalCount,
    deletingScanId,
    isClearingAll,
    isBusy: isClearingAll || deleteScanMutation.isPending,
    requestDeleteScan,
    requestClearAllScans,
  };
}

import { useEffect, useRef, useState } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { scanKeys } from '../hooks/useScans';
import type { ScanListResponse } from '../types/api';
import { getApiErrorMessage } from '../services/api/client';
import type { ScanImageSource } from '../lib/media/buildScanFormData';
import * as scansService from '../services/scans.service';
import type { RootStackParamList } from '../navigation/types';
import {
  ANALYZE_PHASE_LABELS,
  type AnalyzePhase,
} from './camera.types';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Analyzing'>;

const UPLOAD_PERCENT_MAX = 40;
const PROCESSING_PERCENT_MAX = 70;
const ANALYZING_PERCENT_MAX = 95;

export function useAnalyzingViewModel(
  image: ScanImageSource,
  navigation: Navigation,
) {
  const queryClient = useQueryClient();
  const startedRef = useRef(false);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [phase, setPhase] = useState<AnalyzePhase>('preparing');
  const [percent, setPercent] = useState(0);

  const phaseLabel = ANALYZE_PHASE_LABELS[phase];

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    const clearSimTimer = () => {
      if (simTimerRef.current) {
        clearInterval(simTimerRef.current);
        simTimerRef.current = null;
      }
    };

    const startPostUploadProgress = () => {
      clearSimTimer();
      setPhase('processing');
      setPercent((current) => Math.max(current, UPLOAD_PERCENT_MAX + 2));

      simTimerRef.current = setInterval(() => {
        setPercent((current) => {
          if (current >= ANALYZING_PERCENT_MAX) {
            return current;
          }

          const next = current + 1;

          if (next >= PROCESSING_PERCENT_MAX) {
            setPhase('analyzing');
          }

          return next;
        });
      }, 120);
    };

    const run = async () => {
      setPhase('preparing');
      setPercent(5);

      try {
        const scan = await scansService.createScan(image, (event) => {
          if (event.phase === 'uploading') {
            setPhase('uploading');
            const scaled = Math.round(8 + (event.percent / 100) * (UPLOAD_PERCENT_MAX - 8));
            setPercent(scaled);

            if (event.percent >= 100) {
              startPostUploadProgress();
            }
          }

          if (event.phase === 'upload-complete') {
            startPostUploadProgress();
          }
        });

        clearSimTimer();
        setPhase('complete');
        setPercent(100);

        queryClient.setQueryData(scanKeys.detail(scan.id), scan);
        queryClient.setQueryData<ScanListResponse>(scanKeys.list(), (current) => {
          if (!current) {
            return { items: [scan], nextCursor: null, hasMore: false };
          }

          const withoutDuplicate = current.items.filter((item) => item.id !== scan.id);

          return {
            ...current,
            items: [scan, ...withoutDuplicate],
          };
        });

        await queryClient.invalidateQueries({ queryKey: scanKeys.list() });

        navigation.replace('ScanResult', {
          scanId: scan.id,
          imageUri: image.uri,
          caption: scan.caption,
        });
      } catch (error) {
        clearSimTimer();
        setPhase('error');
        Toast.show({ type: 'error', text1: getApiErrorMessage(error) });
        navigation.goBack();
      }
    };

    run();

    return clearSimTimer;
  }, [image, navigation, queryClient]);

  return {
    phase,
    percent,
    phaseLabel,
    isComplete: phase === 'complete',
    hasError: phase === 'error',
  };
}

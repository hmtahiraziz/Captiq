import {
  buildScanFormData,
  type ScanImageSource,
} from '../lib/media/buildScanFormData';
import type { ScanProgressEvent } from '../viewmodels/camera.types';
import type { Message, Scan, ScanListResponse, SendMessageResponse } from '../types/api';
import { apiClient, unwrapApi } from './api/client';

export async function createScan(
  image: string | ScanImageSource,
  onProgress?: (event: ScanProgressEvent) => void,
): Promise<Scan> {
  const formData = buildScanFormData(image);

  onProgress?.({ phase: 'uploading', percent: 0 });

  return unwrapApi(
    apiClient.post('/scans', formData, {
      onUploadProgress: (event) => {
        if (!event.total) {
          return;
        }

        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress?.({ phase: 'uploading', percent });

        if (event.loaded >= event.total) {
          onProgress?.({ phase: 'upload-complete' });
        }
      },
    }),
  );
}

export async function getScans(cursor?: string, limit = 20): Promise<ScanListResponse> {
  return unwrapApi(
    apiClient.get('/scans', { params: { cursor, limit } }),
  );
}

export async function getScanById(scanId: string): Promise<Scan> {
  return unwrapApi(apiClient.get(`/scans/${scanId}`));
}

export async function deleteScan(scanId: string): Promise<void> {
  await unwrapApi(apiClient.delete(`/scans/${scanId}`));
}

export async function getMessages(scanId: string): Promise<Message[]> {
  return unwrapApi(apiClient.get(`/scans/${scanId}/messages`));
}

export async function sendMessage(
  scanId: string,
  content: string,
): Promise<SendMessageResponse> {
  return unwrapApi(
    apiClient.post(`/scans/${scanId}/messages`, { content }),
  );
}

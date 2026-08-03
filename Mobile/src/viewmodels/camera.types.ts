export type AnalyzePhase =
  | 'preparing'
  | 'uploading'
  | 'processing'
  | 'analyzing'
  | 'complete'
  | 'error';

export const ANALYZE_PHASE_LABELS: Record<AnalyzePhase, string> = {
  preparing: 'Preparing image...',
  uploading: 'Uploading photo...',
  processing: 'Processing image...',
  analyzing: 'Generating AI caption...',
  complete: 'Done!',
  error: 'Something went wrong',
};

export type ScanProgressEvent =
  | { phase: 'uploading'; percent: number }
  | { phase: 'upload-complete' };

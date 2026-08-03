export interface ScanImageSource {
  uri: string;
  mimeType?: string;
  fileName?: string;
}

function guessMimeType(uri: string): string {
  const extension = uri.split('?')[0]?.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
    case 'heif':
      return 'image/heic';
    default:
      return 'image/jpeg';
  }
}

function guessFileName(mimeType: string): string {
  const extension = mimeType.split('/')[1] ?? 'jpg';
  return `scan.${extension}`;
}

export function normalizeScanImageSource(
  source: string | ScanImageSource,
): ScanImageSource {
  if (typeof source === 'string') {
    return { uri: source };
  }

  return source;
}

export function buildScanFormData(source: string | ScanImageSource): FormData {
  const image = normalizeScanImageSource(source);
  const mimeType = image.mimeType ?? guessMimeType(image.uri);
  const fileName = image.fileName ?? guessFileName(mimeType);

  const formData = new FormData();
  formData.append('image', {
    uri: image.uri,
    type: mimeType,
    name: fileName,
  } as unknown as Blob);

  return formData;
}

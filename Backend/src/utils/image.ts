import { ValidationError } from './errors.js';

/** Allow high-res phone photos (e.g. 48–100MP) before downscaling for AI. */
const MAX_INPUT_PIXELS = 12_000 * 12_000;

/** Detect common image types by magic bytes (ignores client Content-Type). */
export function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length < 12) {
    return null;
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return 'image/gif';
  }

  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }

  return null;
}

export function assertValidImageBuffer(buffer: Buffer): void {
  if (!detectImageMime(buffer)) {
    throw new ValidationError('File is not a valid JPEG, PNG, GIF, or WebP image');
  }
}

export { MAX_INPUT_PIXELS };

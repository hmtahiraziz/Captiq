import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assertValidImageBuffer, detectImageMime } from './image.js';
import { ValidationError } from './errors.js';

describe('detectImageMime', () => {
  it('detects JPEG magic bytes', () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    assert.equal(detectImageMime(buf), 'image/jpeg');
  });

  it('detects PNG magic bytes', () => {
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    assert.equal(detectImageMime(buf), 'image/png');
  });

  it('rejects non-images', () => {
    assert.equal(detectImageMime(Buffer.from('not-an-image!!!!')), null);
    assert.throws(() => assertValidImageBuffer(Buffer.from('hello')), ValidationError);
  });
});

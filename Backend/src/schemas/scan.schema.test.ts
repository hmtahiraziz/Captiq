import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMessageSchema, listScansQuerySchema, scanIdParamsSchema } from './scan.schema.js';

describe('scan schemas', () => {
  it('caps message length', () => {
    const result = createMessageSchema.safeParse({ content: 'x'.repeat(4001) });
    assert.equal(result.success, false);
  });

  it('requires UUID scan id', () => {
    assert.equal(scanIdParamsSchema.safeParse({ id: 'not-a-uuid' }).success, false);
    assert.equal(
      scanIdParamsSchema.safeParse({ id: '550e8400-e29b-41d4-a716-446655440000' }).success,
      true,
    );
  });

  it('caps pagination limit', () => {
    const result = listScansQuerySchema.safeParse({ limit: '99' });
    assert.equal(result.success, false);
  });
});

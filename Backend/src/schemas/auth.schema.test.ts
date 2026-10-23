import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schema.js';

describe('auth schemas', () => {
  it('rejects unknown keys (strict)', () => {
    const result = registerSchema.safeParse({
      email: 'a@b.com',
      password: 'password1',
      role: 'admin',
    });
    assert.equal(result.success, false);
  });

  it('rejects password longer than 72', () => {
    const result = resetPasswordSchema.safeParse({
      email: 'user@captiq.ai',
      code: '123456',
      password: 'x'.repeat(73),
    });
    assert.equal(result.success, false);
  });

  it('accepts valid reset body with 6-digit code', () => {
    const result = resetPasswordSchema.safeParse({
      email: 'user@captiq.ai',
      code: '123456',
      password: 'password1',
    });
    assert.equal(result.success, true);
  });

  it('rejects non-digit or wrong-length reset codes', () => {
    assert.equal(
      resetPasswordSchema.safeParse({
        email: 'user@captiq.ai',
        code: '12345',
        password: 'password1',
      }).success,
      false,
    );
    assert.equal(
      resetPasswordSchema.safeParse({
        email: 'user@captiq.ai',
        code: 'abcdef',
        password: 'password1',
      }).success,
      false,
    );
  });

  it('accepts valid login body', () => {
    const result = loginSchema.safeParse({
      email: 'user@captiq.ai',
      password: 'secret',
    });
    assert.equal(result.success, true);
  });
});

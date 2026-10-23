import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;
const JWT_ISSUER = 'captiq-api';
const JWT_AUDIENCE = 'captiq-mobile';

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    expiresIn: ACCESS_TOKEN_TTL,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    algorithms: ['HS256'],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });

  if (typeof payload !== 'object' || payload === null || typeof payload.sub !== 'string') {
    throw new Error('Invalid access token payload');
  }

  return {
    sub: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : '',
  };
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('base64url');
}

/** HMAC-SHA256 with refresh secret as pepper (invalidates prior unsalted hashes). */
export function hashToken(token: string): string {
  return crypto
    .createHmac('sha256', env.JWT_REFRESH_SECRET)
    .update(token)
    .digest('hex');
}

export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
}

/** Cryptographically random 6-digit code (000000–999999). */
export function generatePasswordResetCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function getPasswordResetExpiry(): Date {
  return new Date(Date.now() + PASSWORD_RESET_TTL_MS);
}

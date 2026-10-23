import bcrypt from 'bcrypt';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users, refreshTokens, passwordResetTokens } from '../db/schema.js';
import {
  generateRefreshToken,
  generatePasswordResetCode,
  getRefreshTokenExpiry,
  getPasswordResetExpiry,
  hashToken,
  signAccessToken,
} from '../utils/jwt.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../utils/errors.js';
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RecordConsentInput,
  RegisterInput,
  ResetPasswordInput,
} from '../schemas/auth.schema.js';
import { CURRENT_CONSENT_VERSION } from '../constants/consent.js';
import { sendPasswordResetEmail } from './email.service.js';
import { deleteUserScanFolder } from './cloudinary.service.js';

const BCRYPT_ROUNDS = 12;

let dummyHashPromise: Promise<string> | null = null;

function getDummyPasswordHash(): Promise<string> {
  if (!dummyHashPromise) {
    dummyHashPromise = bcrypt.hash('__captiq_timing_dummy__', BCRYPT_ROUNDS);
  }
  return dummyHashPromise;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

async function revokeAllRefreshTokens(userId: string, at: Date = new Date()): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ revokedAt: at })
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
}

async function createTokens(userId: string, email: string): Promise<AuthTokens> {
  const accessToken = signAccessToken({ sub: userId, email });
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);

  await db.insert(refreshTokens).values({
    userId,
    tokenHash,
    expiresAt: getRefreshTokenExpiry(),
  });

  return {
    accessToken,
    refreshToken,
    user: { id: userId, email },
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthTokens> {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email.toLowerCase()),
  });

  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const [user] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      passwordHash,
    })
    .returning({ id: users.id, email: users.email });

  if (!user) {
    throw new Error('Failed to create user');
  }

  return createTokens(user.id, user.email);
}

export async function loginUser(input: LoginInput): Promise<AuthTokens> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email.toLowerCase()),
  });

  const passwordHash = user?.passwordHash ?? (await getDummyPasswordHash());
  const valid = await bcrypt.compare(input.password, passwordHash);

  if (!user || !valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return createTokens(user.id, user.email);
}

export async function refreshUserToken(rawRefreshToken: string): Promise<AuthTokens> {
  const tokenHash = hashToken(rawRefreshToken);
  const now = new Date();

  const stored = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.tokenHash, tokenHash),
    with: { user: true },
  });

  if (!stored?.user) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  if (stored.revokedAt) {
    await revokeAllRefreshTokens(stored.userId, now);
    throw new UnauthorizedError('Session revoked. Please sign in again.', 'TOKEN_REUSE');
  }

  if (stored.expiresAt <= now) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const consumed = await db
    .update(refreshTokens)
    .set({ revokedAt: now })
    .where(
      and(
        eq(refreshTokens.id, stored.id),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, now),
      ),
    )
    .returning({ id: refreshTokens.id });

  if (consumed.length === 0) {
    await revokeAllRefreshTokens(stored.userId, now);
    throw new UnauthorizedError('Session revoked. Please sign in again.', 'TOKEN_REUSE');
  }

  return createTokens(stored.user.id, stored.user.email);
}

export async function logoutUser(rawRefreshToken: string): Promise<void> {
  const tokenHash = hashToken(rawRefreshToken);

  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.tokenHash, tokenHash));
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<{ message: string }> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);

  if (!valid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
  const now = new Date();

  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  await revokeAllRefreshTokens(userId, now);

  return { message: 'Password updated successfully. Please sign in again.' };
}

export async function getUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      email: true,
      createdAt: true,
      consentVersion: true,
      consentedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return {
    ...user,
    needsConsent: user.consentVersion !== CURRENT_CONSENT_VERSION,
    currentConsentVersion: CURRENT_CONSENT_VERSION,
  };
}

export async function recordUserConsent(userId: string, input: RecordConsentInput) {
  if (input.version !== CURRENT_CONSENT_VERSION) {
    throw new ValidationError('Consent version is outdated. Refresh the app and try again.');
  }

  const now = new Date();

  await db
    .update(users)
    .set({
      consentVersion: input.version,
      consentedAt: now,
    })
    .where(eq(users.id, userId));

  return {
    consentVersion: input.version,
    consentedAt: now,
    needsConsent: false,
    currentConsentVersion: CURRENT_CONSENT_VERSION,
  };
}

export async function deleteUserAccount(userId: string): Promise<{ message: string }> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  await deleteUserScanFolder(userId).catch(() => undefined);
  await db.delete(users).where(eq(users.id, userId));

  return { message: 'Account deleted successfully' };
}

const PASSWORD_RESET_ACK_MESSAGE =
  'If an account exists with that email, a reset code has been sent.';

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<{ message: string }> {
  const email = input.email.toLowerCase();
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return { message: PASSWORD_RESET_ACK_MESSAGE };
  }

  const now = new Date();

  await db
    .update(passwordResetTokens)
    .set({ usedAt: now })
    .where(
      and(
        eq(passwordResetTokens.userId, user.id),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now),
      ),
    );

  const code = generatePasswordResetCode();
  const tokenHash = hashToken(code);

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt: getPasswordResetExpiry(),
  });

  await sendPasswordResetEmail(user.email, code);

  return { message: PASSWORD_RESET_ACK_MESSAGE };
}

export async function resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
  const email = input.email.toLowerCase();
  const now = new Date();

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new ValidationError('Invalid or expired reset code');
  }

  const tokenHash = hashToken(input.code);

  const stored = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(passwordResetTokens.userId, user.id),
      eq(passwordResetTokens.tokenHash, tokenHash),
      isNull(passwordResetTokens.usedAt),
      gt(passwordResetTokens.expiresAt, now),
    ),
  });

  if (!stored) {
    throw new ValidationError('Invalid or expired reset code');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));
  await db
    .update(passwordResetTokens)
    .set({ usedAt: now })
    .where(eq(passwordResetTokens.id, stored.id));
  await revokeAllRefreshTokens(user.id, now);

  return { message: 'Password updated successfully' };
}

import bcrypt from 'bcrypt';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users, refreshTokens, passwordResetTokens } from '../db/schema.js';
import {
  generateRefreshToken,
  generatePasswordResetToken,
  getRefreshTokenExpiry,
  getPasswordResetExpiry,
  hashToken,
  signAccessToken,
} from '../utils/jwt.js';
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '../schemas/auth.schema.js';
import { buildPasswordResetUrl, sendPasswordResetEmail } from './email.service.js';

const BCRYPT_ROUNDS = 12;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
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

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);

  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return createTokens(user.id, user.email);
}

export async function refreshUserToken(refreshToken: string): Promise<AuthTokens> {
  const tokenHash = hashToken(refreshToken);
  const now = new Date();

  const stored = await db.query.refreshTokens.findFirst({
    where: and(
      eq(refreshTokens.tokenHash, tokenHash),
      isNull(refreshTokens.revokedAt),
      gt(refreshTokens.expiresAt, now),
    ),
    with: {
      user: true,
    },
  });

  if (!stored?.user) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  await db
    .update(refreshTokens)
    .set({ revokedAt: now })
    .where(eq(refreshTokens.id, stored.id));

  return createTokens(stored.user.id, stored.user.email);
}

export async function logoutUser(refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken);

  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.tokenHash, tokenHash));
}

export async function getUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, email: true, createdAt: true },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}

const PASSWORD_RESET_ACK_MESSAGE =
  'If an account exists with that email, a reset link has been sent.';

export async function requestPasswordReset(input: ForgotPasswordInput): Promise<{ message: string }> {
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

  const rawToken = generatePasswordResetToken();
  const tokenHash = hashToken(rawToken);

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt: getPasswordResetExpiry(),
  });

  const resetUrl = buildPasswordResetUrl(rawToken);
  await sendPasswordResetEmail(user.email, resetUrl);

  return { message: PASSWORD_RESET_ACK_MESSAGE };
}

export async function resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
  const tokenHash = hashToken(input.token);
  const now = new Date();

  const stored = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(passwordResetTokens.tokenHash, tokenHash),
      isNull(passwordResetTokens.usedAt),
      gt(passwordResetTokens.expiresAt, now),
    ),
    with: {
      user: true,
    },
  });

  if (!stored?.user) {
    throw new ValidationError('This reset link is invalid or has expired');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, stored.userId));

    await tx
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(eq(passwordResetTokens.id, stored.id));

    await tx
      .update(refreshTokens)
      .set({ revokedAt: now })
      .where(
        and(
          eq(refreshTokens.userId, stored.userId),
          isNull(refreshTokens.revokedAt),
        ),
      );
  });

  return { message: 'Password updated successfully' };
}

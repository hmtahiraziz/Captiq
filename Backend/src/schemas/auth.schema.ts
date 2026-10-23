import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required').max(72),
  })
  .strict();

export const refreshTokenSchema = z
  .object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: z.string().email('Invalid email address'),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    code: z
      .string()
      .regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
    password: passwordSchema,
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(72),
    newPassword: passwordSchema,
  })
  .strict();

export const recordConsentSchema = z
  .object({
    version: z.string().min(1).max(32),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RecordConsentInput = z.infer<typeof recordConsentSchema>;

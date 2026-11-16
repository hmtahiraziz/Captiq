import { z } from 'zod';

/** Keep in sync with Backend `src/schemas/auth.schema.ts`. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email');

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`);

export const requiredPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`);

export const resetCodeSchema = z
  .string()
  .regex(/^\d{6}$/, 'Enter the 6-digit code from your email');

function withMatchingPasswords<
  T extends z.ZodRawShape & {
    password: z.ZodTypeAny;
    confirmPassword: z.ZodTypeAny;
  },
>(shape: T) {
  return z.object(shape).refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
}

export const loginSchema = z.object({
  email: emailSchema,
  password: requiredPasswordSchema,
});

export const registerSchema = withMatchingPasswords({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirm your password'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = withMatchingPasswords({
  code: resetCodeSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirm your password'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: requiredPasswordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    message: 'New password must be different from your current password',
    path: ['newPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

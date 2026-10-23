import { Router } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import {
  changePassword,
  deleteUserAccount,
  getUserById,
  loginUser,
  logoutUser,
  recordUserConsent,
  refreshUserToken,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from '../services/auth.service.js';
import { getQuotaUsage } from '../services/quota.service.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  recordConsentSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  type ChangePasswordInput,
  type ForgotPasswordInput,
  type LoginInput,
  type RecordConsentInput,
  type RefreshTokenInput,
  type RegisterInput,
  type ResetPasswordInput,
} from '../schemas/auth.schema.js';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

const authLimiterMessage = {
  success: false,
  error: { message: 'Too many attempts. Please try again later.' },
};

const loginIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: authLimiterMessage,
});

const loginAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: authLimiterMessage,
  keyGenerator: (req) => {
    const email =
      typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : '';
    if (email) {
      return `login-account:${email}`;
    }
    // IPv6-safe fallback when body email is missing
    return `login-account:ip:${ipKeyGenerator(req.ip ?? 'unknown')}`;
  },
});

const registerIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: authLimiterMessage,
});

const refreshIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: authLimiterMessage,
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many reset attempts. Please try again later.' },
  },
});

router.post(
  '/register',
  registerIpLimiter,
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const body = res.locals.validatedBody as RegisterInput;
    const tokens = await registerUser(body);
    res.status(201).json({ success: true, data: tokens });
  }),
);

router.post(
  '/login',
  loginIpLimiter,
  validateBody(loginSchema),
  loginAccountLimiter,
  asyncHandler(async (req, res) => {
    const body = res.locals.validatedBody as LoginInput;
    const tokens = await loginUser(body);
    res.json({ success: true, data: tokens });
  }),
);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  validateBody(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const body = res.locals.validatedBody as ForgotPasswordInput;
    const result = await requestPasswordReset(body);
    res.json({ success: true, data: result });
  }),
);

router.post(
  '/reset-password',
  passwordResetLimiter,
  validateBody(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const body = res.locals.validatedBody as ResetPasswordInput;
    const result = await resetPassword(body);
    res.json({ success: true, data: result });
  }),
);

router.post(
  '/refresh',
  refreshIpLimiter,
  validateBody(refreshTokenSchema),
  asyncHandler(async (req, res) => {
    const body = res.locals.validatedBody as RefreshTokenInput;
    const tokens = await refreshUserToken(body.refreshToken);
    res.json({ success: true, data: tokens });
  }),
);

router.post(
  '/logout',
  validateBody(refreshTokenSchema),
  asyncHandler(async (req, res) => {
    const body = res.locals.validatedBody as RefreshTokenInput;
    await logoutUser(body.refreshToken);
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  }),
);

router.post(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const body = res.locals.validatedBody as ChangePasswordInput;
    const result = await changePassword(user.id, body);
    res.json({ success: true, data: result });
  }),
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const profile = await getUserById(user.id);
    res.json({ success: true, data: profile });
  }),
);

router.get(
  '/quota',
  authenticate,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const quota = await getQuotaUsage(user.id);
    res.json({ success: true, data: quota });
  }),
);

router.post(
  '/consent',
  authenticate,
  validateBody(recordConsentSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const body = res.locals.validatedBody as RecordConsentInput;
    const result = await recordUserConsent(user.id, body);
    res.json({ success: true, data: result });
  }),
);

router.delete(
  '/account',
  authenticate,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const result = await deleteUserAccount(user.id);
    res.json({ success: true, data: result });
  }),
);

export default router;

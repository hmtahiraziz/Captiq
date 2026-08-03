import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getUserById,
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from '../services/auth.service.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RefreshTokenInput,
  type RegisterInput,
  type ResetPasswordInput,
} from '../schemas/auth.schema.js';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

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
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const body = res.locals.validatedBody as RegisterInput;
    const tokens = await registerUser(body);
    res.status(201).json({ success: true, data: tokens });
  }),
);

router.post(
  '/login',
  validateBody(loginSchema),
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

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const profile = await getUserById(user.id);
    res.json({ success: true, data: profile });
  }),
);

export default router;

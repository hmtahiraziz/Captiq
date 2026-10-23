import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import { validateBody, validateQuery } from '../middleware/validate.middleware.js';
import {
  createMessageSchema,
  listScansQuerySchema,
  type CreateMessageInput,
  type ListScansQuery,
} from '../schemas/scan.schema.js';
import {
  createScan,
  deleteScan,
  getScanById,
  getScanMessages,
  listScans,
  sendScanMessage,
} from '../services/scan.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ValidationError } from '../utils/errors.js';
import { getParam } from '../utils/params.js';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

function handleUpload(req: Request, res: Response, next: NextFunction): void {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      next(err instanceof Error ? err : new ValidationError('Upload failed'));
      return;
    }
    next();
  });
}

router.use(authenticate);

router.post(
  '/',
  handleUpload,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    if (!req.file) {
      throw new ValidationError('Image file is required');
    }

    const scan = await createScan(user.id, req.file.buffer);
    res.status(201).json({ success: true, data: scan });
  }),
);

router.get(
  '/',
  validateQuery(listScansQuerySchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const query = res.locals.validatedQuery as ListScansQuery;
    const result = await listScans(user.id, query);
    res.json({ success: true, data: result });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const scan = await getScanById(user.id, getParam(req.params.id));
    res.json({ success: true, data: scan });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    await deleteScan(user.id, getParam(req.params.id));
    res.json({ success: true, data: { message: 'Scan deleted' } });
  }),
);

router.get(
  '/:id/messages',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const thread = await getScanMessages(user.id, getParam(req.params.id));
    res.json({ success: true, data: thread });
  }),
);

router.post(
  '/:id/messages',
  validateBody(createMessageSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const body = res.locals.validatedBody as CreateMessageInput;
    const message = await sendScanMessage(user.id, getParam(req.params.id), body.content);
    res.status(201).json({ success: true, data: message });
  }),
);

export default router;

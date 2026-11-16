import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middleware/validate.middleware.js';
import {
  createMessageSchema,
  listScansQuerySchema,
  scanIdParamsSchema,
  type CreateMessageInput,
  type ListScansQuery,
  type ScanIdParams,
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
  validateParams(scanIdParamsSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { id } = res.locals.validatedParams as ScanIdParams;
    const scan = await getScanById(user.id, id);
    res.json({ success: true, data: scan });
  }),
);

router.delete(
  '/:id',
  validateParams(scanIdParamsSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { id } = res.locals.validatedParams as ScanIdParams;
    await deleteScan(user.id, id);
    res.json({ success: true, data: { message: 'Scan deleted' } });
  }),
);

router.get(
  '/:id/messages',
  validateParams(scanIdParamsSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { id } = res.locals.validatedParams as ScanIdParams;
    const thread = await getScanMessages(user.id, id);
    res.json({ success: true, data: thread });
  }),
);

router.post(
  '/:id/messages',
  validateParams(scanIdParamsSchema),
  validateBody(createMessageSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { id } = res.locals.validatedParams as ScanIdParams;
    const body = res.locals.validatedBody as CreateMessageInput;
    const message = await sendScanMessage(user.id, id, body.content);
    res.status(201).json({ success: true, data: message });
  }),
);

export default router;

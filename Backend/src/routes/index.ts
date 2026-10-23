import { Router } from 'express';
import authRoutes from './auth.routes.js';
import scansRoutes from './scans.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/scans', scansRoutes);

export default router;

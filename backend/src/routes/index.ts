import { Router } from 'express';
import { successResponse } from '@/utils/api-response';
import authRouter from '@/modules/auth/auth.routes';

const router = Router();

router.get('/health', (req, res) => {
  return successResponse(res, 'School ERP System API is running smoothly', {
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Auth modular routes
router.use('/auth', authRouter);

export default router;


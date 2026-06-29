import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuth } from './auth.middleware';

const router = Router();
const controller = new AuthController();

/**
 * Register authentication module routes.
 */
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.post('/refresh', controller.refresh);
router.get('/me', requireAuth, controller.getMe);

export default router;

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
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);
router.post('/change-password', requireAuth, controller.changePassword);

export default router;

import { Router } from 'express';
import { UserController } from './user.controller';
import { requireAuth, requirePermission } from '@/modules/auth/auth.middleware';

const router = Router();
const userController = new UserController();

router.use(requireAuth);

router.post('/', requirePermission('users.write'), userController.createUser);
router.get('/', requirePermission('users.read'), userController.getAllUsers);
router.get('/:id', requirePermission('users.read'), userController.getUserById);
router.put('/:id', requirePermission('users.write'), userController.updateUser);
router.delete('/:id', requirePermission('users.write'), userController.deleteUser);

export default router;

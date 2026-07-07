import { Router } from 'express';
import { RoleController } from './role.controller';
import { requireAuth, requirePermission } from '@/modules/auth/auth.middleware';

const router = Router();
const roleController = new RoleController();

router.use(requireAuth);

router.post('/', requirePermission('roles.write'), roleController.createRole);
router.get('/', requirePermission('roles.read'), roleController.getAllRoles);
router.get('/:id', requirePermission('roles.read'), roleController.getRoleById);
router.put('/:id', requirePermission('roles.write'), roleController.updateRole);
router.delete('/:id', requirePermission('roles.write'), roleController.deleteRole);

export default router;

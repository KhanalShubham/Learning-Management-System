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

// Users modular routes
import userRouter from '@/modules/users/user.routes';
router.use('/users', userRouter);

// Roles modular routes
import roleRouter from '@/modules/roles/role.routes';
router.use('/roles', roleRouter);

// System configuration engine modular routes
import systemConfigRouter from '@/modules/system-config/system-config.routes';
router.use('/system', systemConfigRouter);

// Academic structure engine modular routes
import academicStructureRouter from '@/modules/academic-structure/academic-structure.routes';
router.use('/academic-structure', academicStructureRouter);

// Student admission engine modular routes
import studentRouter from '@/modules/students/student.routes';
router.use('/students', studentRouter);

export default router;


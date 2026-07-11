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

// Faculty management engine modular routes
import facultyRouter from '@/modules/faculty/faculty.routes';
router.use('/faculty', facultyRouter);

// Public marketing site modular routes (unauthenticated)
import publicSiteRouter from '@/modules/public-site/public-site.routes';
router.use('/public', publicSiteRouter);

// Notice CMS modular routes (public reads, authenticated admin writes)
import noticeRouter from '@/modules/notices/notice.routes';
router.use('/notices', noticeRouter);

// Gallery CMS modular routes (public reads, authenticated admin writes)
import galleryRouter from '@/modules/gallery/gallery.routes';
router.use('/gallery', galleryRouter);

// Attendance engine modular routes
import attendanceRouter from '@/modules/attendance/attendance.routes';
router.use('/attendance', attendanceRouter);

// Exams engine modular routes
import examsRouter from '@/modules/exams/exams.routes';
router.use('/exams', examsRouter);

// Document & Certificate Engine modular routes
import documentRouter from '@/modules/documents/document.routes';
router.use('/documents', documentRouter);

export default router;


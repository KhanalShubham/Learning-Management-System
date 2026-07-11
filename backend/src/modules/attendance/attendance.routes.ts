import { Router } from 'express';
import { requireAuth, requirePermission } from '@/modules/auth/auth.middleware';
import { StudentAttendanceController } from './student-attendance.controller';
import { TeacherAttendanceController } from './teacher-attendance.controller';
import { AttendanceConfigController } from './attendance-config.controller';

const router = Router();
router.use(requireAuth);

const studentController = new StudentAttendanceController();
const teacherController = new TeacherAttendanceController();
const configController = new AttendanceConfigController();

// -------------------------------------------------------------------------
// Global Config & Locks Routes (Admin/Super Admin only)
// -------------------------------------------------------------------------
router.post('/holidays', requirePermission('settings.write'), configController.createHoliday);
router.get('/holidays', configController.getHolidays);
router.delete('/holidays/:id', requirePermission('settings.write'), configController.deleteHoliday);

router.post('/locks', requirePermission('attendance.teacher.mark'), configController.toggleLock);

// -------------------------------------------------------------------------
// Student Attendance Routes
// -------------------------------------------------------------------------
router.get('/students/dashboard', requirePermission('attendance.view'), studentController.getDashboardStats);
router.get('/students/register', requirePermission('attendance.view'), studentController.getMonthlyRegister);
router.get('/students/register/export', requirePermission('attendance.view'), studentController.exportMonthlyRegisterCSV);
router.post('/students', requirePermission('attendance.mark'), studentController.markAttendance);
router.get('/students', requirePermission('attendance.view'), studentController.getDailyAttendance);
router.get('/students/:studentId', requirePermission('attendance.view'), studentController.getStudentAttendanceHistory);

// -------------------------------------------------------------------------
// Teacher Attendance Routes (Restricted: Admin / Super Admin only)
// -------------------------------------------------------------------------
router.get('/teachers/dashboard', requirePermission('attendance.teacher.view'), teacherController.getDashboardStats);
router.get('/teachers/register', requirePermission('attendance.teacher.view'), teacherController.getMonthlyRegister);
router.get('/teachers/register/export', requirePermission('attendance.teacher.view'), teacherController.exportMonthlyRegisterCSV);
router.post('/teachers', requirePermission('attendance.teacher.mark'), teacherController.markAttendance);
router.get('/teachers', requirePermission('attendance.teacher.view'), teacherController.getDailyAttendance);
router.get('/teachers/:teacherId', requirePermission('attendance.teacher.view'), teacherController.getTeacherAttendanceHistory);

export default router;

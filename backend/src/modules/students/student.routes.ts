/**
 * Student Admission Engine
 *
 * Student is the outcome of an admission workflow (POST /admission), not a
 * bare CRUD entity. academicYearId/classId/sectionId are foreign keys into
 * the Academic Engine's reference data — this engine never redefines or
 * duplicates Class/Section concepts, only references them.
 */
import { Router } from 'express';
import { requireAuth, requirePermission } from '@/modules/auth/auth.middleware';
import { upload, uploadDocument } from '@/middleware/upload.middleware';
import { StudentController } from './student.controller';

const router = Router();
router.use(requireAuth);

const canRead = requirePermission('students.read');
const canAdmit = requirePermission('students.admit');
const canUpdate = requirePermission('students.update');
const canArchive = requirePermission('students.archive');

const studentController = new StudentController();

// Generic upload plumbing (no DB write) — used during the admission form
// and for later profile/document edits.
router.post('/photo-upload', canAdmit, upload.single('file'), studentController.uploadPhoto);
router.post(
  '/document-upload',
  canAdmit,
  uploadDocument.single('file'),
  studentController.uploadDocumentFile
);

// Admission workflow
router.post('/admission', canAdmit, studentController.admitStudent);

// Student records
router.get('/', canRead, studentController.getAllStudents);
router.get('/summary', canRead, studentController.getSummary);
router.get('/:id', canRead, studentController.getStudentById);
router.put('/:id', canUpdate, studentController.updateStudent);
router.post('/:id/status', canArchive, studentController.updateStudentStatus);
router.delete('/:id', canArchive, studentController.deleteStudent);

// Guardians
router.post('/:id/guardians', canUpdate, studentController.addGuardian);
router.put('/:id/guardians/:guardianId', canUpdate, studentController.updateGuardian);
router.delete('/:id/guardians/:guardianId', canUpdate, studentController.deleteGuardian);

// Documents
router.post('/:id/documents', canUpdate, studentController.addDocument);
router.delete('/:id/documents/:documentId', canUpdate, studentController.deleteDocument);

export default router;

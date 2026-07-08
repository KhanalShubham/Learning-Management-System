/**
 * Faculty Management Engine
 *
 * Department and Designation are reference data owned exclusively by this
 * engine (mirrors how Subject/ExamType are owned by the Academic Engine).
 * Teacher is a workflow entity — registration generates an employeeId, the
 * same shape as Student Admission — not a bare CRUD resource.
 *
 * See docs/architecture/faculty-engine-design-spec.md for the full design.
 */
import { Router } from 'express';
import { requireAuth, requirePermission, requireAnyPermission } from '@/modules/auth/auth.middleware';
import { upload, uploadDocument } from '@/middleware/upload.middleware';
import { DepartmentController } from './department.controller';
import { DesignationController } from './designation.controller';
import { TeacherController } from './teacher.controller';

const router = Router();
router.use(requireAuth);

// Dedicated Faculty Engine permissions. teachers.archive covers both
// reference-data archival and terminal teacher-status changes — the same
// "archive and hard-delete are both retirement actions" reasoning as the
// Academic Engine's academic.archive. teachers.salary/leave/documents are
// split out from teachers.update because compensation, leave, and identity
// documents warrant tighter access than a routine profile edit.
const canRead = requirePermission('teachers.read');
const canCreate = requirePermission('teachers.create');
const canUpdate = requirePermission('teachers.update');
const canArchive = requirePermission('teachers.archive');
const canLeave = requirePermission('teachers.leave');
const canDocuments = requirePermission('teachers.documents');

// Departments
const departmentController = new DepartmentController();
router.post('/departments', canCreate, departmentController.createDepartment);
router.get('/departments', canRead, departmentController.getAllDepartments);
router.get('/departments/:id', canRead, departmentController.getDepartmentById);
router.put('/departments/:id', canUpdate, departmentController.updateDepartment);
router.post('/departments/:id/archive', canArchive, departmentController.archiveDepartment);
router.delete('/departments/:id', canArchive, departmentController.deleteDepartment);

// Designations
const designationController = new DesignationController();
router.post('/designations', canCreate, designationController.createDesignation);
router.get('/designations', canRead, designationController.getAllDesignations);
router.get('/designations/:id', canRead, designationController.getDesignationById);
router.put('/designations/:id', canUpdate, designationController.updateDesignation);
router.post('/designations/:id/archive', canArchive, designationController.archiveDesignation);
router.delete('/designations/:id', canArchive, designationController.deleteDesignation);

// Teachers
const teacherController = new TeacherController();

// Generic upload plumbing (no DB write) — same pattern as /students/photo-upload.
router.post('/teachers/photo-upload', canCreate, upload.single('file'), teacherController.uploadPhoto);
router.post(
  '/teachers/document-upload',
  canDocuments,
  uploadDocument.single('file'),
  teacherController.uploadDocumentFile
);

router.post('/teachers', canCreate, teacherController.registerTeacher);
router.get('/teachers', canRead, teacherController.getAllTeachers);
router.get('/teachers/summary', canRead, teacherController.getSummary);
router.get('/teachers/:id', canRead, teacherController.getTeacherById);
router.put('/teachers/:id', canUpdate, teacherController.updateTeacher);
// Accepts either permission at the route layer — the service resolves the
// precise rule by target status (non-terminal needs teachers.update,
// terminal needs teachers.archive; see teacher.service.ts.updateStatus).
router.post(
  '/teachers/:id/status',
  requireAnyPermission(['teachers.update', 'teachers.archive']),
  teacherController.updateTeacherStatus
);
router.delete('/teachers/:id', canArchive, teacherController.deleteTeacher);

// Qualifications
router.post('/teachers/:id/qualifications', canUpdate, teacherController.addQualification);
router.delete(
  '/teachers/:id/qualifications/:qualificationId',
  canUpdate,
  teacherController.deleteQualification
);

// Emergency contacts
router.post('/teachers/:id/emergency-contacts', canUpdate, teacherController.addEmergencyContact);
router.put(
  '/teachers/:id/emergency-contacts/:contactId',
  canUpdate,
  teacherController.updateEmergencyContact
);
router.delete(
  '/teachers/:id/emergency-contacts/:contactId',
  canUpdate,
  teacherController.deleteEmergencyContact
);

// Documents
router.post('/teachers/:id/documents', canDocuments, teacherController.addDocument);
router.delete('/teachers/:id/documents/:documentId', canDocuments, teacherController.deleteDocument);

// Leave balance (ledger only — see docs/architecture/faculty-engine-design-spec.md §1)
router.get('/teachers/:id/leave-balance', canLeave, teacherController.getLeaveBalance);
router.patch('/teachers/:id/leave-balance', canLeave, teacherController.adjustLeaveBalance);

export default router;

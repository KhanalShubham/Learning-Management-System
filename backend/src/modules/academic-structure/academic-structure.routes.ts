/**
 * Academic Structure Engine — Reference Data
 *
 * AcademicYear, Class, Section, Subject, ClassSubject, ExamType (and
 * GradingScale in system-config) are reference data owned exclusively by
 * this engine.
 * Downstream modules (Student, Attendance, Examination, Finance) must only
 * hold foreign keys into these tables — never define their own copies of
 * class/section/subject concepts or duplicate CRUD for them.
 */
import { Router } from 'express';
import { requireAuth, requirePermission } from '@/modules/auth/auth.middleware';
import { ClassController } from './class.controller';
import { SectionController } from './section.controller';
import { SubjectController } from './subject.controller';
import { ClassSubjectController } from './class-subject.controller';
import { ExamTypeController } from './exam-type.controller';
import { AcademicStructureController } from './academic-structure.controller';

const router = Router();
router.use(requireAuth);

// Dedicated Academic Engine permissions (not shared with system.read/write).
// Archive and hard-delete are both "retirement" actions and share one
// permission — delete is only reachable when a record has zero references
// anyway (see each service's delete guard), so it doesn't need its own tier.
const canRead = requirePermission('academic.read');
const canCreate = requirePermission('academic.create');
const canUpdate = requirePermission('academic.update');
const canArchive = requirePermission('academic.archive');

// Aggregate structure tree
const academicStructureController = new AcademicStructureController();
router.get('/structure', canRead, academicStructureController.getStructureTree);

// Classes
const classController = new ClassController();
router.post('/classes', canCreate, classController.createClass);
router.get('/classes', canRead, classController.getAllClasses);
router.get('/classes/:id', canRead, classController.getClassById);
router.put('/classes/:id', canUpdate, classController.updateClass);
router.post('/classes/:id/archive', canArchive, classController.archiveClass);
router.delete('/classes/:id', canArchive, classController.deleteClass);

// Sections
const sectionController = new SectionController();
router.post('/sections', canCreate, sectionController.createSection);
router.get('/sections', canRead, sectionController.getAllSections);
router.get('/sections/:id', canRead, sectionController.getSectionById);
router.put('/sections/:id', canUpdate, sectionController.updateSection);
router.post('/sections/:id/archive', canArchive, sectionController.archiveSection);
router.delete('/sections/:id', canArchive, sectionController.deleteSection);

// Subjects
const subjectController = new SubjectController();
router.post('/subjects', canCreate, subjectController.createSubject);
router.get('/subjects', canRead, subjectController.getAllSubjects);
router.get('/subjects/:id', canRead, subjectController.getSubjectById);
router.put('/subjects/:id', canUpdate, subjectController.updateSubject);
router.post('/subjects/:id/archive', canArchive, subjectController.archiveSubject);
router.delete('/subjects/:id', canArchive, subjectController.deleteSubject);

// Class Subjects
const classSubjectController = new ClassSubjectController();
router.post('/class-subjects', canCreate, classSubjectController.createClassSubject);
router.get('/class-subjects', canRead, classSubjectController.getAllClassSubjects);
router.get('/class-subjects/:id', canRead, classSubjectController.getClassSubjectById);
router.put('/class-subjects/:id', canUpdate, classSubjectController.updateClassSubject);
router.delete('/class-subjects/:id', canArchive, classSubjectController.deleteClassSubject);

// Exam Types
const examTypeController = new ExamTypeController();
router.post('/exam-types', canCreate, examTypeController.createExamType);
router.get('/exam-types', canRead, examTypeController.getAllExamTypes);
router.get('/exam-types/:id', canRead, examTypeController.getExamTypeById);
router.put('/exam-types/:id', canUpdate, examTypeController.updateExamType);
router.post('/exam-types/:id/archive', canArchive, examTypeController.archiveExamType);
router.delete('/exam-types/:id', canArchive, examTypeController.deleteExamType);

export default router;

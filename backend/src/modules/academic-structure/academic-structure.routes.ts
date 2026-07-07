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

const readOnly = requirePermission('system.read');
const readWrite = requirePermission('system.write');

// Aggregate structure tree
const academicStructureController = new AcademicStructureController();
router.get('/structure', readOnly, academicStructureController.getStructureTree);

// Classes
const classController = new ClassController();
router.post('/classes', readWrite, classController.createClass);
router.get('/classes', readOnly, classController.getAllClasses);
router.get('/classes/:id', readOnly, classController.getClassById);
router.put('/classes/:id', readWrite, classController.updateClass);
router.post('/classes/:id/archive', readWrite, classController.archiveClass);
router.delete('/classes/:id', readWrite, classController.deleteClass);

// Sections
const sectionController = new SectionController();
router.post('/sections', readWrite, sectionController.createSection);
router.get('/sections', readOnly, sectionController.getAllSections);
router.get('/sections/:id', readOnly, sectionController.getSectionById);
router.put('/sections/:id', readWrite, sectionController.updateSection);
router.post('/sections/:id/archive', readWrite, sectionController.archiveSection);
router.delete('/sections/:id', readWrite, sectionController.deleteSection);

// Subjects
const subjectController = new SubjectController();
router.post('/subjects', readWrite, subjectController.createSubject);
router.get('/subjects', readOnly, subjectController.getAllSubjects);
router.get('/subjects/:id', readOnly, subjectController.getSubjectById);
router.put('/subjects/:id', readWrite, subjectController.updateSubject);
router.post('/subjects/:id/archive', readWrite, subjectController.archiveSubject);
router.delete('/subjects/:id', readWrite, subjectController.deleteSubject);

// Class Subjects
const classSubjectController = new ClassSubjectController();
router.post('/class-subjects', readWrite, classSubjectController.createClassSubject);
router.get('/class-subjects', readOnly, classSubjectController.getAllClassSubjects);
router.get('/class-subjects/:id', readOnly, classSubjectController.getClassSubjectById);
router.put('/class-subjects/:id', readWrite, classSubjectController.updateClassSubject);
router.delete('/class-subjects/:id', readWrite, classSubjectController.deleteClassSubject);

// Exam Types
const examTypeController = new ExamTypeController();
router.post('/exam-types', readWrite, examTypeController.createExamType);
router.get('/exam-types', readOnly, examTypeController.getAllExamTypes);
router.get('/exam-types/:id', readOnly, examTypeController.getExamTypeById);
router.put('/exam-types/:id', readWrite, examTypeController.updateExamType);
router.post('/exam-types/:id/archive', readWrite, examTypeController.archiveExamType);
router.delete('/exam-types/:id', readWrite, examTypeController.deleteExamType);

export default router;

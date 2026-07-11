import { Router } from 'express';
import { requireAuth, requirePermission } from '@/modules/auth/auth.middleware';
import { ExamsController } from './exams.controller';

const router = Router();
router.use(requireAuth);

const controller = new ExamsController();

// Exam Terms Management
router.post('/terms', requirePermission('exams.manage'), controller.createExamTerm);
router.get('/terms', requirePermission('exams.view'), controller.listExamTerms);

// Exam Schedules
router.post('/', requirePermission('exams.manage'), controller.createExam);
router.get('/', requirePermission('exams.view'), controller.listExams);

// Marks Entry Sheets Roster & Submissions
router.get('/:id/ledger', requirePermission('exams.enter'), controller.getExamRoster);
router.post('/:id/ledger', requirePermission('exams.enter'), controller.submitExamMarks);

// Publication state controls
router.post('/terms/:id/publish', requirePermission('exams.publish'), controller.publishExamTerm);
router.get('/terms/:id/report-cards', requirePermission('exams.view'), controller.getTermReportCards);
router.get('/terms/:id/report-cards/:studentId', requirePermission('exams.view'), controller.getStudentReportCard);

export default router;

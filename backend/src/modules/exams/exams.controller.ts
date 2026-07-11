import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { AppError } from '@/middleware/error.middleware';
import { PrismaExamsRepository } from './exams.repository';
import { ExamsService } from './exams.service';
import {
  createExamTermSchema,
  createExamSchema,
  submitExamMarksSchema,
  queryExamsSchema,
} from './exams.validator';
import { ExamResultStatus } from '@prisma/client';

const examsRepo = new PrismaExamsRepository();
const examsService = new ExamsService(examsRepo);

export class ExamsController {
  public createExamTerm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createExamTermSchema.parse(req.body);
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Authentication credentials missing', 401);
      }

      const term = await examsService.createExamTerm(validated, userId);
      return successResponse(res, 'Exam term created successfully.', term, 201);
    } catch (error) {
      next(error);
    }
  };

  public listExamTerms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const academicYearId = req.query.academicYearId as string | undefined;
      const terms = await examsService.listExamTerms(academicYearId);
      return successResponse(res, 'Exam terms retrieved successfully.', terms);
    } catch (error) {
      next(error);
    }
  };

  public createExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createExamSchema.parse(req.body);
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Authentication credentials missing', 401);
      }

      const exam = await examsService.createExam(validated, userId);
      return successResponse(res, 'Exam scheduled successfully.', exam, 201);
    } catch (error) {
      next(error);
    }
  };

  public listExams = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = queryExamsSchema.parse(req.query);
      const exams = await examsService.listExams(filters);
      return successResponse(res, 'Exams list retrieved successfully.', exams);
    } catch (error) {
      next(error);
    }
  };

  public getExamRoster = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const examId = req.params.id;
      const roster = await examsService.getExamRoster(examId);
      return successResponse(res, 'Exam roster retrieved successfully.', roster);
    } catch (error) {
      next(error);
    }
  };

  public submitExamMarks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const examId = req.params.id;
      const validated = submitExamMarksSchema.parse(req.body);
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Authentication credentials missing', 401);
      }

      await examsService.submitExamMarks(examId, validated.records, userId);
      return successResponse(res, 'Exam marks saved successfully.', null);
    } catch (error) {
      next(error);
    }
  };

  public publishExamTerm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const termId = req.params.id;
      const status = req.body.status as ExamResultStatus;
      if (!Object.values(ExamResultStatus).includes(status)) {
        throw new AppError('Invalid publication status', 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Authentication credentials missing', 401);
      }

      const term = await examsService.publishExamTerm(termId, status, userId);
      return successResponse(res, `Exam term results status updated to ${status} successfully.`, term);
    } catch (error) {
      next(error);
    }
  };

  public getStudentReportCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const termId = req.params.id;
      const studentId = req.params.studentId;
      const card = await examsService.getStudentReportCard(termId, studentId);
      return successResponse(res, 'Student report card retrieved successfully.', card);
    } catch (error) {
      next(error);
    }
  };

  public getTermReportCards = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const termId = req.params.id;
      const classId = req.query.classId as string;
      const cards = await examsService.getTermReportCards(termId, classId || undefined);
      return successResponse(res, 'Term report cards list retrieved successfully.', cards);
    } catch (error) {
      next(error);
    }
  };
}

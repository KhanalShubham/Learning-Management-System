import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { ExamTypeRepository } from './exam-type.repository';
import { ExamTypeService } from './exam-type.service';
import {
  createExamTypeSchema,
  examTypeIdParamSchema,
  listExamTypesQuerySchema,
  updateExamTypeSchema,
} from './exam-type.validator';

const examTypeRepository = new ExamTypeRepository();
const examTypeService = new ExamTypeService(examTypeRepository);

export class ExamTypeController {
  public createExamType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createExamTypeSchema.parse(req.body);
      const examType = await examTypeService.createExamType(validated);
      return successResponse(res, 'Exam type created successfully.', { examType }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getExamTypeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = examTypeIdParamSchema.parse(req.params);
      const examType = await examTypeService.getExamTypeById(id);
      return successResponse(res, 'Exam type retrieved successfully.', { examType });
    } catch (error) {
      next(error);
    }
  };

  public getAllExamTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { academicYearId, includeArchived } = listExamTypesQuerySchema.parse(req.query);
      const examTypes = await examTypeService.getAllExamTypes(academicYearId, includeArchived);
      return successResponse(res, 'Exam types retrieved successfully.', { examTypes });
    } catch (error) {
      next(error);
    }
  };

  public updateExamType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = examTypeIdParamSchema.parse(req.params);
      const validated = updateExamTypeSchema.parse(req.body);
      const examType = await examTypeService.updateExamType(id, validated);
      return successResponse(res, 'Exam type updated successfully.', { examType });
    } catch (error) {
      next(error);
    }
  };

  public archiveExamType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = examTypeIdParamSchema.parse(req.params);
      const examType = await examTypeService.archiveExamType(id);
      return successResponse(res, 'Exam type archived successfully.', { examType });
    } catch (error) {
      next(error);
    }
  };

  public deleteExamType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = examTypeIdParamSchema.parse(req.params);
      const examType = await examTypeService.deleteExamType(id);
      return successResponse(res, 'Exam type deleted successfully.', { examType });
    } catch (error) {
      next(error);
    }
  };
}

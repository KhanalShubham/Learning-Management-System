import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { AcademicTermRepository } from './academic-term.repository';
import { AcademicTermService } from './academic-term.service';
import {
  academicTermIdParamSchema,
  createAcademicTermSchema,
  updateAcademicTermSchema,
} from './academic-term.validator';

const academicTermRepository = new AcademicTermRepository();
const academicTermService = new AcademicTermService(academicTermRepository);

export class AcademicTermController {
  public createTerm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createAcademicTermSchema.parse(req.body);
      const term = await academicTermService.createTerm(validated);
      return successResponse(res, 'Academic term created successfully.', { term }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getAllTerms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const terms = await academicTermService.getAllTerms();
      return successResponse(res, 'Academic terms retrieved successfully.', { terms });
    } catch (error) {
      next(error);
    }
  };

  public updateTerm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = academicTermIdParamSchema.parse(req.params);
      const validated = updateAcademicTermSchema.parse(req.body);
      const term = await academicTermService.updateTerm(id, validated);
      return successResponse(res, 'Academic term updated successfully.', { term });
    } catch (error) {
      next(error);
    }
  };

  public deleteTerm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = academicTermIdParamSchema.parse(req.params);
      const term = await academicTermService.deleteTerm(id);
      return successResponse(res, 'Academic term deleted successfully.', { term });
    } catch (error) {
      next(error);
    }
  };
}

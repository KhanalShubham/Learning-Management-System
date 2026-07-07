import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { AcademicYearRepository } from './academic-year.repository';
import { AcademicYearService } from './academic-year.service';
import {
  academicYearIdParamSchema,
  createAcademicYearSchema,
  updateAcademicYearSchema,
} from './academic-year.validator';

const academicYearRepository = new AcademicYearRepository();
const academicYearService = new AcademicYearService(academicYearRepository);

export class AcademicYearController {
  public createAcademicYear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createAcademicYearSchema.parse(req.body);
      const year = await academicYearService.createAcademicYear(validated);
      return successResponse(res, 'Academic year created successfully.', { year }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getAcademicYearById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = academicYearIdParamSchema.parse(req.params);
      const year = await academicYearService.getAcademicYearById(id);
      return successResponse(res, 'Academic year retrieved successfully.', { year });
    } catch (error) {
      next(error);
    }
  };

  public getAllAcademicYears = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const years = await academicYearService.getAllAcademicYears();
      return successResponse(res, 'Academic years retrieved successfully.', { years });
    } catch (error) {
      next(error);
    }
  };

  public updateAcademicYear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = academicYearIdParamSchema.parse(req.params);
      const validated = updateAcademicYearSchema.parse(req.body);
      const year = await academicYearService.updateAcademicYear(id, validated);
      return successResponse(res, 'Academic year updated successfully.', { year });
    } catch (error) {
      next(error);
    }
  };

  public deleteAcademicYear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = academicYearIdParamSchema.parse(req.params);
      const year = await academicYearService.deleteAcademicYear(id);
      return successResponse(res, 'Academic year deleted successfully.', { year });
    } catch (error) {
      next(error);
    }
  };

  public activateAcademicYear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = academicYearIdParamSchema.parse(req.params);
      const year = await academicYearService.activateAcademicYear(id);
      return successResponse(res, 'Academic year activated successfully.', { year });
    } catch (error) {
      next(error);
    }
  };
}

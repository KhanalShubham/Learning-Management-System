import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { GradingScaleRepository } from './grading-scale.repository';
import { GradingScaleService } from './grading-scale.service';
import {
  gradingScaleIdParamSchema,
  createGradingScaleSchema,
  updateGradingScaleSchema,
} from './grading-scale.validator';

const gradingScaleRepository = new GradingScaleRepository();
const gradingScaleService = new GradingScaleService(gradingScaleRepository);

export class GradingScaleController {
  public createScale = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createGradingScaleSchema.parse(req.body);
      const scale = await gradingScaleService.createScale(validated);
      return successResponse(res, 'Grading scale created successfully.', { scale }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getAllScales = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const scales = await gradingScaleService.getAllScales();
      return successResponse(res, 'Grading scales retrieved successfully.', { scales });
    } catch (error) {
      next(error);
    }
  };

  public updateScale = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = gradingScaleIdParamSchema.parse(req.params);
      const validated = updateGradingScaleSchema.parse(req.body);
      const scale = await gradingScaleService.updateScale(id, validated);
      return successResponse(res, 'Grading scale updated successfully.', { scale });
    } catch (error) {
      next(error);
    }
  };

  public deleteScale = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = gradingScaleIdParamSchema.parse(req.params);
      const scale = await gradingScaleService.deleteScale(id);
      return successResponse(res, 'Grading scale deleted successfully.', { scale });
    } catch (error) {
      next(error);
    }
  };
}

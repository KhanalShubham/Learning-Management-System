import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { AcademicStructureRepository } from './academic-structure.repository';
import { AcademicStructureService } from './academic-structure.service';
import { z } from 'zod';

const treeQuerySchema = z.object({
  academicYearId: z.string().uuid('Invalid Academic Year ID').optional(),
});

const academicStructureRepository = new AcademicStructureRepository();
const academicStructureService = new AcademicStructureService(academicStructureRepository);

/**
 * Engine-level aggregate endpoint — composes the existing per-entity
 * repositories/tables into a single tree response for one-shot consumption
 * (e.g. React Query). Does not duplicate entity CRUD logic.
 */
export class AcademicStructureController {
  public getStructureTree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { academicYearId } = treeQuerySchema.parse(req.query);
      const tree = await academicStructureService.getStructureTree(academicYearId);
      return successResponse(res, 'Academic structure tree retrieved successfully.', tree);
    } catch (error) {
      next(error);
    }
  };
}

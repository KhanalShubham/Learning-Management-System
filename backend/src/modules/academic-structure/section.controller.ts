import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { SectionRepository } from './section.repository';
import { SectionService } from './section.service';
import {
  createSectionSchema,
  listSectionsQuerySchema,
  sectionIdParamSchema,
  updateSectionSchema,
} from './section.validator';

const sectionRepository = new SectionRepository();
const sectionService = new SectionService(sectionRepository);

export class SectionController {
  public createSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createSectionSchema.parse(req.body);
      const section = await sectionService.createSection(validated);
      return successResponse(res, 'Section created successfully.', { section }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getSectionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = sectionIdParamSchema.parse(req.params);
      const section = await sectionService.getSectionById(id);
      return successResponse(res, 'Section retrieved successfully.', { section });
    } catch (error) {
      next(error);
    }
  };

  public getAllSections = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { classId, includeArchived } = listSectionsQuerySchema.parse(req.query);
      const sections = await sectionService.getAllSections(classId, includeArchived);
      return successResponse(res, 'Sections retrieved successfully.', { sections });
    } catch (error) {
      next(error);
    }
  };

  public updateSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = sectionIdParamSchema.parse(req.params);
      const validated = updateSectionSchema.parse(req.body);
      const section = await sectionService.updateSection(id, validated);
      return successResponse(res, 'Section updated successfully.', { section });
    } catch (error) {
      next(error);
    }
  };

  public archiveSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = sectionIdParamSchema.parse(req.params);
      const section = await sectionService.archiveSection(id);
      return successResponse(res, 'Section archived successfully.', { section });
    } catch (error) {
      next(error);
    }
  };

  public deleteSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = sectionIdParamSchema.parse(req.params);
      const section = await sectionService.deleteSection(id);
      return successResponse(res, 'Section deleted successfully.', { section });
    } catch (error) {
      next(error);
    }
  };
}

import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { ClassRepository } from './class.repository';
import { ClassService } from './class.service';
import { classIdParamSchema, createClassSchema, listClassesQuerySchema, updateClassSchema } from './class.validator';

const classRepository = new ClassRepository();
const classService = new ClassService(classRepository);

export class ClassController {
  public createClass = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createClassSchema.parse(req.body);
      const cls = await classService.createClass(validated);
      return successResponse(res, 'Class created successfully.', { class: cls }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getClassById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = classIdParamSchema.parse(req.params);
      const cls = await classService.getClassById(id);
      return successResponse(res, 'Class retrieved successfully.', { class: cls });
    } catch (error) {
      next(error);
    }
  };

  public getAllClasses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { academicYearId, includeArchived } = listClassesQuerySchema.parse(req.query);
      const classes = await classService.getAllClasses(academicYearId, includeArchived);
      return successResponse(res, 'Classes retrieved successfully.', { classes });
    } catch (error) {
      next(error);
    }
  };

  public updateClass = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = classIdParamSchema.parse(req.params);
      const validated = updateClassSchema.parse(req.body);
      const cls = await classService.updateClass(id, validated);
      return successResponse(res, 'Class updated successfully.', { class: cls });
    } catch (error) {
      next(error);
    }
  };

  public archiveClass = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = classIdParamSchema.parse(req.params);
      const cls = await classService.archiveClass(id);
      return successResponse(res, 'Class archived successfully.', { class: cls });
    } catch (error) {
      next(error);
    }
  };

  public deleteClass = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = classIdParamSchema.parse(req.params);
      const cls = await classService.deleteClass(id);
      return successResponse(res, 'Class deleted successfully.', { class: cls });
    } catch (error) {
      next(error);
    }
  };
}

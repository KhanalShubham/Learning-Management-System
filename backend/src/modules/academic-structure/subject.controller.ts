import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { SubjectRepository } from './subject.repository';
import { SubjectService } from './subject.service';
import {
  createSubjectSchema,
  listSubjectsQuerySchema,
  subjectIdParamSchema,
  updateSubjectSchema,
} from './subject.validator';

const subjectRepository = new SubjectRepository();
const subjectService = new SubjectService(subjectRepository);

export class SubjectController {
  public createSubject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createSubjectSchema.parse(req.body);
      const subject = await subjectService.createSubject(validated);
      return successResponse(res, 'Subject created successfully.', { subject }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getSubjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = subjectIdParamSchema.parse(req.params);
      const subject = await subjectService.getSubjectById(id);
      return successResponse(res, 'Subject retrieved successfully.', { subject });
    } catch (error) {
      next(error);
    }
  };

  public getAllSubjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { includeArchived } = listSubjectsQuerySchema.parse(req.query);
      const subjects = await subjectService.getAllSubjects(includeArchived);
      return successResponse(res, 'Subjects retrieved successfully.', { subjects });
    } catch (error) {
      next(error);
    }
  };

  public updateSubject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = subjectIdParamSchema.parse(req.params);
      const validated = updateSubjectSchema.parse(req.body);
      const subject = await subjectService.updateSubject(id, validated);
      return successResponse(res, 'Subject updated successfully.', { subject });
    } catch (error) {
      next(error);
    }
  };

  public archiveSubject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = subjectIdParamSchema.parse(req.params);
      const subject = await subjectService.archiveSubject(id);
      return successResponse(res, 'Subject archived successfully.', { subject });
    } catch (error) {
      next(error);
    }
  };

  public deleteSubject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = subjectIdParamSchema.parse(req.params);
      const subject = await subjectService.deleteSubject(id);
      return successResponse(res, 'Subject deleted successfully.', { subject });
    } catch (error) {
      next(error);
    }
  };
}

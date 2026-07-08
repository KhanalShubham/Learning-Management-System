import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { ClassSubjectRepository } from './class-subject.repository';
import { ClassSubjectService } from './class-subject.service';
import { TeacherRepository } from '@/modules/faculty/teacher.repository';
import {
  assignTeacherSchema,
  classSubjectIdParamSchema,
  createClassSubjectSchema,
  listClassSubjectsQuerySchema,
  updateClassSubjectSchema,
} from './class-subject.validator';

const classSubjectRepository = new ClassSubjectRepository();
const classSubjectService = new ClassSubjectService(classSubjectRepository, new TeacherRepository());

export class ClassSubjectController {
  public createClassSubject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createClassSubjectSchema.parse(req.body);
      const classSubject = await classSubjectService.createClassSubject(validated);
      return successResponse(res, 'Class subject created successfully.', { classSubject }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getClassSubjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = classSubjectIdParamSchema.parse(req.params);
      const classSubject = await classSubjectService.getClassSubjectById(id);
      return successResponse(res, 'Class subject retrieved successfully.', { classSubject });
    } catch (error) {
      next(error);
    }
  };

  public getAllClassSubjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { classId } = listClassSubjectsQuerySchema.parse(req.query);
      const classSubjects = await classSubjectService.getAllClassSubjects(classId);
      return successResponse(res, 'Class subjects retrieved successfully.', { classSubjects });
    } catch (error) {
      next(error);
    }
  };

  public updateClassSubject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = classSubjectIdParamSchema.parse(req.params);
      const validated = updateClassSubjectSchema.parse(req.body);
      const classSubject = await classSubjectService.updateClassSubject(id, validated);
      return successResponse(res, 'Class subject updated successfully.', { classSubject });
    } catch (error) {
      next(error);
    }
  };

  public deleteClassSubject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = classSubjectIdParamSchema.parse(req.params);
      const classSubject = await classSubjectService.deleteClassSubject(id);
      return successResponse(res, 'Class subject deleted successfully.', { classSubject });
    } catch (error) {
      next(error);
    }
  };

  public assignTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = classSubjectIdParamSchema.parse(req.params);
      const { teacherId } = assignTeacherSchema.parse(req.body);
      const classSubject = await classSubjectService.assignTeacher(id, teacherId);
      return successResponse(res, 'Teacher assignment updated successfully.', { classSubject });
    } catch (error) {
      next(error);
    }
  };
}

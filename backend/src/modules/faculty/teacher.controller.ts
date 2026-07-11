import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { writeAuditLog } from '@/utils/audit-log';
import { AppError } from '@/middleware/error.middleware';
import { hasPermission } from '@/modules/auth/auth.middleware';
import { uploadImageBuffer, uploadDocumentBuffer } from '@/config/cloudinary';
import { TeacherRepository } from './teacher.repository';
import { TeacherService } from './teacher.service';
import { DepartmentRepository } from './department.repository';
import { DesignationRepository } from './designation.repository';
import { SchoolProfileRepository } from '@/modules/system-config/school-profile.repository';
import {
  registerTeacherSchema,
  teacherIdParamSchema,
  teacherQualificationParamSchema,
  teacherContactParamSchema,
  teacherDocumentParamSchema,
  listTeachersQuerySchema,
  updateTeacherSchema,
  updateTeacherStatusSchema,
  addQualificationSchema,
  addEmergencyContactSchema,
  updateEmergencyContactSchema,
  addDocumentSchema,
  adjustLeaveBalanceSchema,
} from './teacher.validator';

const auditContext = (req: Request) => ({
  userId: req.user?.id,
  email: req.user?.email,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});

const teacherRepository = new TeacherRepository();
const teacherService = new TeacherService(
  teacherRepository,
  new DepartmentRepository(),
  new DesignationRepository(),
  new SchoolProfileRepository()
);

export class TeacherController {
  public registerTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = registerTeacherSchema.parse(req.body);
      const canSetSalary = hasPermission(req, 'teachers.salary');
      const teacher = await teacherService.registerTeacher(validated, canSetSalary);
      await writeAuditLog({
        ...auditContext(req),
        action: 'TEACHER_REGISTERED',
        entityType: 'teacher',
        entityId: teacher.id,
        details: `Registered teacher ${teacher.id} (${teacher.employeeId})`,
      });
      return successResponse(res, 'Teacher registered successfully.', { teacher }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getTeacherById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = teacherIdParamSchema.parse(req.params);
      const canSeeSalary = hasPermission(req, 'teachers.salary');
      const teacher = await teacherService.getTeacherById(id, canSeeSalary);
      return successResponse(res, 'Teacher retrieved successfully.', { teacher });
    } catch (error) {
      next(error);
    }
  };

  public getAllTeachers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = listTeachersQuerySchema.parse(req.query);
      const canSeeSalary = hasPermission(req, 'teachers.salary');
      const result = await teacherService.getAllTeachers(filters, canSeeSalary);
      return successResponse(res, 'Teachers retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await teacherService.getSummary();
      return successResponse(res, 'Teacher summary retrieved successfully.', { summary });
    } catch (error) {
      next(error);
    }
  };

  public updateTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = teacherIdParamSchema.parse(req.params);
      const validated = updateTeacherSchema.parse(req.body);
      const canSetSalary = hasPermission(req, 'teachers.salary');
      const teacher = await teacherService.updateTeacher(id, validated, canSetSalary);
      await writeAuditLog({
        ...auditContext(req),
        action: 'TEACHER_UPDATED',
        entityType: 'teacher',
        entityId: id,
        details: `Updated teacher ${id}`,
      });
      return successResponse(res, 'Teacher updated successfully.', { teacher });
    } catch (error) {
      next(error);
    }
  };

  public updateTeacherStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = teacherIdParamSchema.parse(req.params);
      const { status, leavingDate } = updateTeacherStatusSchema.parse(req.body);
      const canArchive = hasPermission(req, 'teachers.archive');
      const teacher = await teacherService.updateStatus(id, status, leavingDate, canArchive);
      await writeAuditLog({
        ...auditContext(req),
        action: 'TEACHER_STATUS_CHANGED',
        entityType: 'teacher',
        entityId: id,
        details: `Teacher ${id} status changed to ${status}`,
      });
      return successResponse(res, 'Teacher status updated successfully.', { teacher });
    } catch (error) {
      next(error);
    }
  };

  public deleteTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = teacherIdParamSchema.parse(req.params);
      const teacher = await teacherService.deleteTeacher(id);
      await writeAuditLog({
        ...auditContext(req),
        action: 'TEACHER_ARCHIVED',
        entityType: 'teacher',
        entityId: id,
        details: `Deleted teacher ${id} (${teacher.employeeId})`,
      });
      return successResponse(res, 'Teacher deleted successfully.', { teacher });
    } catch (error) {
      next(error);
    }
  };

  public addQualification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = teacherIdParamSchema.parse(req.params);
      const validated = addQualificationSchema.parse(req.body);
      const qualification = await teacherService.addQualification(id, validated);
      return successResponse(res, 'Qualification added successfully.', { qualification }, 201);
    } catch (error) {
      next(error);
    }
  };

  public deleteQualification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, qualificationId } = teacherQualificationParamSchema.parse(req.params);
      const qualification = await teacherService.deleteQualification(id, qualificationId);
      return successResponse(res, 'Qualification removed successfully.', { qualification });
    } catch (error) {
      next(error);
    }
  };

  public addEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = teacherIdParamSchema.parse(req.params);
      const validated = addEmergencyContactSchema.parse(req.body);
      const contact = await teacherService.addEmergencyContact(id, validated);
      return successResponse(res, 'Emergency contact added successfully.', { contact }, 201);
    } catch (error) {
      next(error);
    }
  };

  public updateEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, contactId } = teacherContactParamSchema.parse(req.params);
      const validated = updateEmergencyContactSchema.parse(req.body);
      const contact = await teacherService.updateEmergencyContact(id, contactId, validated);
      return successResponse(res, 'Emergency contact updated successfully.', { contact });
    } catch (error) {
      next(error);
    }
  };

  public deleteEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, contactId } = teacherContactParamSchema.parse(req.params);
      const contact = await teacherService.deleteEmergencyContact(id, contactId);
      return successResponse(res, 'Emergency contact removed successfully.', { contact });
    } catch (error) {
      next(error);
    }
  };

  public addDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = teacherIdParamSchema.parse(req.params);
      const validated = addDocumentSchema.parse(req.body);
      const document = await teacherService.addDocument(id, validated);
      return successResponse(res, 'Document added successfully.', { document }, 201);
    } catch (error) {
      next(error);
    }
  };

  public deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, documentId } = teacherDocumentParamSchema.parse(req.params);
      const document = await teacherService.deleteDocument(id, documentId);
      return successResponse(res, 'Document removed successfully.', { document });
    } catch (error) {
      next(error);
    }
  };

  public getLeaveBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = teacherIdParamSchema.parse(req.params);
      const leaveBalance = await teacherService.getLeaveBalance(id);
      return successResponse(res, 'Leave balance retrieved successfully.', { leaveBalance });
    } catch (error) {
      next(error);
    }
  };

  public adjustLeaveBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = teacherIdParamSchema.parse(req.params);
      const validated = adjustLeaveBalanceSchema.parse(req.body);
      const leaveBalance = await teacherService.adjustLeaveBalance(id, validated);
      await writeAuditLog({
        ...auditContext(req),
        action: 'TEACHER_LEAVE_BALANCE_ADJUSTED',
        entityType: 'teacher',
        entityId: id,
        details: `Adjusted leave balance for teacher ${id}`,
      });
      return successResponse(res, 'Leave balance updated successfully.', { leaveBalance });
    } catch (error) {
      next(error);
    }
  };

  // Generic upload plumbing (no DB write) — mirrors /students/photo-upload
  // and /students/document-upload; a photo/document can be uploaded before
  // the Teacher record exists.
  public uploadPhoto = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }
      const photoUrl = await uploadImageBuffer(req.file.buffer, 'teachers/photos');
      return successResponse(res, 'Photo uploaded successfully.', { photoUrl });
    } catch (error) {
      next(error);
    }
  };

  public uploadDocumentFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }
      const fileUrl = await uploadDocumentBuffer(req.file.buffer, 'teachers/documents');
      return successResponse(res, 'File uploaded successfully.', { fileUrl });
    } catch (error) {
      next(error);
    }
  };
}

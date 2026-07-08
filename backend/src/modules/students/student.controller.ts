import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { writeAuditLog } from '@/utils/audit-log';
import { AppError } from '@/middleware/error.middleware';
import { uploadImageBuffer, uploadDocumentBuffer } from '@/config/cloudinary';
import { StudentRepository } from './student.repository';
import { StudentService } from './student.service';
import { AcademicYearRepository } from '@/modules/system-config/academic-year.repository';
import { SchoolProfileRepository } from '@/modules/system-config/school-profile.repository';
import { ClassRepository } from '@/modules/academic-structure/class.repository';
import { SectionRepository } from '@/modules/academic-structure/section.repository';
import {
  admitStudentSchema,
  studentIdParamSchema,
  studentGuardianParamSchema,
  studentDocumentParamSchema,
  listStudentsQuerySchema,
  updateStudentSchema,
  updateStudentStatusSchema,
  promoteStudentSchema,
  addGuardianSchema,
  updateGuardianSchema,
  addDocumentSchema,
} from './student.validator';

const auditContext = (req: Request) => ({
  userId: req.user?.id,
  email: req.user?.email,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});

const studentRepository = new StudentRepository();
const studentService = new StudentService(
  studentRepository,
  new AcademicYearRepository(),
  new SchoolProfileRepository(),
  new ClassRepository(),
  new SectionRepository()
);

export class StudentController {
  public admitStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = admitStudentSchema.parse(req.body);
      const student = await studentService.admitStudent(validated);
      await writeAuditLog({
        ...auditContext(req),
        action: 'STUDENT_ADMITTED',
        details: `Admitted student ${student.id} (${student.admissionNumber})`,
      });
      return successResponse(res, 'Student admitted successfully.', { student }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getStudentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = studentIdParamSchema.parse(req.params);
      const student = await studentService.getStudentById(id);
      return successResponse(res, 'Student retrieved successfully.', { student });
    } catch (error) {
      next(error);
    }
  };

  public getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = listStudentsQuerySchema.parse(req.query);
      const result = await studentService.getAllStudents(filters);
      return successResponse(res, 'Students retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await studentService.getSummary();
      return successResponse(res, 'Student summary retrieved successfully.', { summary });
    } catch (error) {
      next(error);
    }
  };

  public updateStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = studentIdParamSchema.parse(req.params);
      const validated = updateStudentSchema.parse(req.body);
      const student = await studentService.updateStudent(id, validated);
      await writeAuditLog({
        ...auditContext(req),
        action: 'STUDENT_UPDATED',
        details: `Updated student ${id}`,
      });
      return successResponse(res, 'Student updated successfully.', { student });
    } catch (error) {
      next(error);
    }
  };

  public updateStudentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = studentIdParamSchema.parse(req.params);
      const { status } = updateStudentStatusSchema.parse(req.body);
      const student = await studentService.updateStatus(id, status);
      await writeAuditLog({
        ...auditContext(req),
        action: 'STUDENT_STATUS_CHANGED',
        details: `Student ${id} status changed to ${status}`,
      });
      return successResponse(res, 'Student status updated successfully.', { student });
    } catch (error) {
      next(error);
    }
  };

  public promoteStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = studentIdParamSchema.parse(req.params);
      const validated = promoteStudentSchema.parse(req.body);
      const enrollment = await studentService.promoteStudent(id, validated);
      await writeAuditLog({
        ...auditContext(req),
        action: 'STUDENT_PROMOTED',
        details: `Student ${id} promoted to enrollment ${enrollment.id} (${enrollment.academicYear.label}, ${enrollment.class.name} - ${enrollment.section.name})`,
      });
      return successResponse(res, 'Student promoted successfully.', { enrollment }, 201);
    } catch (error) {
      next(error);
    }
  };

  public deleteStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = studentIdParamSchema.parse(req.params);
      const student = await studentService.deleteStudent(id);
      await writeAuditLog({
        ...auditContext(req),
        action: 'STUDENT_DELETED',
        details: `Deleted student ${id} (${student.admissionNumber})`,
      });
      return successResponse(res, 'Student deleted successfully.', { student });
    } catch (error) {
      next(error);
    }
  };

  public addGuardian = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = studentIdParamSchema.parse(req.params);
      const validated = addGuardianSchema.parse(req.body);
      const guardian = await studentService.addGuardian(id, validated);
      return successResponse(res, 'Guardian added successfully.', { guardian }, 201);
    } catch (error) {
      next(error);
    }
  };

  public updateGuardian = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, guardianId } = studentGuardianParamSchema.parse(req.params);
      const validated = updateGuardianSchema.parse(req.body);
      const guardian = await studentService.updateGuardian(id, guardianId, validated);
      return successResponse(res, 'Guardian updated successfully.', { guardian });
    } catch (error) {
      next(error);
    }
  };

  public deleteGuardian = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, guardianId } = studentGuardianParamSchema.parse(req.params);
      const guardian = await studentService.deleteGuardian(id, guardianId);
      return successResponse(res, 'Guardian removed successfully.', { guardian });
    } catch (error) {
      next(error);
    }
  };

  public addDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = studentIdParamSchema.parse(req.params);
      const validated = addDocumentSchema.parse(req.body);
      const document = await studentService.addDocument(id, validated);
      return successResponse(res, 'Document added successfully.', { document }, 201);
    } catch (error) {
      next(error);
    }
  };

  public deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, documentId } = studentDocumentParamSchema.parse(req.params);
      const document = await studentService.deleteDocument(id, documentId);
      return successResponse(res, 'Document removed successfully.', { document });
    } catch (error) {
      next(error);
    }
  };

  // Generic upload endpoints — plumbing only (no DB write). The returned
  // URL is later included in the admission payload or a
  // POST /students/:id/documents call. Kept engine-level (not per-student)
  // since a photo/document can be uploaded before the Student record exists.
  public uploadPhoto = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }
      const photoUrl = await uploadImageBuffer(req.file.buffer, 'students/photos');
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
      const fileUrl = await uploadDocumentBuffer(req.file.buffer, 'students/documents');
      return successResponse(res, 'File uploaded successfully.', { fileUrl });
    } catch (error) {
      next(error);
    }
  };
}

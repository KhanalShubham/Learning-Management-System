import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { AppError } from '@/middleware/error.middleware';
import { StudentAttendanceRepository } from './student-attendance.repository';
import { StudentAttendanceService } from './student-attendance.service';
import { markStudentAttendanceSchema, queryStudentAttendanceSchema } from './attendance.validator';

const studentAttendanceRepo = new StudentAttendanceRepository();
const studentAttendanceService = new StudentAttendanceService(studentAttendanceRepo);

export class StudentAttendanceController {
  public markAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = markStudentAttendanceSchema.parse(req.body);
      const userId = req.user?.id;
      const userPermissions = req.user?.permissions || [];
      if (!userId) {
        throw new AppError('Authentication credentials missing', 401);
      }

      const result = await studentAttendanceService.markAttendance(userId, validated, userPermissions);
      return successResponse(res, 'Student attendance marked successfully.', { records: result }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getDailyAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { academicYearId, classId, sectionId, date } = queryStudentAttendanceSchema.parse(req.query);

      if (!academicYearId || !classId || !sectionId || !date) {
        throw new AppError('academicYearId, classId, sectionId, and date query parameters are required', 400);
      }

      const records = await studentAttendanceService.getDailyAttendance(
        date,
        classId,
        sectionId,
        academicYearId
      );
      return successResponse(res, 'Daily student attendance retrieved successfully.', { records });
    } catch (error) {
      next(error);
    }
  };

  public getStudentAttendanceHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = req.params.studentId;
      if (!studentId) {
        throw new AppError('studentId parameter is required', 400);
      }
      const { startDate, endDate } = queryStudentAttendanceSchema.parse(req.query);

      const records = await studentAttendanceService.getStudentAttendanceHistory(
        studentId,
        startDate,
        endDate
      );
      return successResponse(res, 'Student attendance history retrieved successfully.', { records });
    } catch (error) {
      next(error);
    }
  };

  public getMonthlyRegister = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { academicYearId, classId, sectionId, month, year } = queryStudentAttendanceSchema.parse(req.query);

      if (!academicYearId || !classId || !sectionId || !month || !year) {
        throw new AppError('academicYearId, classId, sectionId, month, and year are required query parameters', 400);
      }

      const register = await studentAttendanceService.getMonthlyRegister(
        academicYearId,
        classId,
        sectionId,
        month,
        year
      );

      return successResponse(res, 'Monthly student attendance register compiled successfully.', { register });
    } catch (error) {
      next(error);
    }
  };

  public exportMonthlyRegisterCSV = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { academicYearId, classId, sectionId, month, year } = queryStudentAttendanceSchema.parse(req.query);

      if (!academicYearId || !classId || !sectionId || !month || !year) {
        throw new AppError('academicYearId, classId, sectionId, month, and year are required query parameters', 400);
      }

      const register = await studentAttendanceService.getMonthlyRegister(
        academicYearId,
        classId,
        sectionId,
        month,
        year
      );

      const daysInMonth = new Date(year, month, 0).getDate();
      const csvData = compileStudentRegisterCSV(register, daysInMonth);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="student-attendance-register-${year}-${month}.csv"`);
      return res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  };

  public getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await studentAttendanceService.getDashboardStats();
      return successResponse(res, 'Student attendance dashboard statistics retrieved successfully.', { stats });
    } catch (error) {
      next(error);
    }
  };
}

function compileStudentRegisterCSV(register: any[], daysInMonth: number): string {
  const headers = ['Roll No', 'Full Name', 'Admission Number'];
  for (let i = 1; i <= daysInMonth; i++) {
    headers.push(`Day ${i}`);
  }
  headers.push('Present', 'Absent', 'Late', 'Half Day', 'Percentage');

  const rows = [headers.join(',')];
  register.forEach((row) => {
    const line = [
      row.rollNumber || '',
      `"${row.fullName.replace(/"/g, '""')}"`,
      row.admissionNumber,
    ];
    for (let i = 1; i <= daysInMonth; i++) {
      line.push(row.days[i] || '-');
    }
    line.push(
      row.stats.present,
      row.stats.absent,
      row.stats.late,
      row.stats.halfDay,
      `${row.stats.percentage}%`
    );
    rows.push(line.join(','));
  });

  return rows.join('\n');
}

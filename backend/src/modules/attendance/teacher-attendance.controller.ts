import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { AppError } from '@/middleware/error.middleware';
import { TeacherAttendanceRepository } from './teacher-attendance.repository';
import { TeacherAttendanceService } from './teacher-attendance.service';
import { markTeacherAttendanceSchema, queryTeacherAttendanceSchema } from './attendance.validator';

const teacherAttendanceRepo = new TeacherAttendanceRepository();
const teacherAttendanceService = new TeacherAttendanceService(teacherAttendanceRepo);

export class TeacherAttendanceController {
  public markAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = markTeacherAttendanceSchema.parse(req.body);
      const userId = req.user?.id;
      const userPermissions = req.user?.permissions || [];
      if (!userId) {
        throw new AppError('Authentication credentials missing', 401);
      }

      const result = await teacherAttendanceService.markAttendance(userId, validated, userPermissions);
      return successResponse(res, 'Teacher attendance marked successfully.', { records: result }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getDailyAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = queryTeacherAttendanceSchema.parse(req.query);

      if (!date) {
        throw new AppError('date query parameter is required', 400);
      }

      const records = await teacherAttendanceService.getDailyAttendance(date);
      return successResponse(res, 'Daily teacher attendance retrieved successfully.', { records });
    } catch (error) {
      next(error);
    }
  };

  public getTeacherAttendanceHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = req.params.teacherId;
      if (!teacherId) {
        throw new AppError('teacherId parameter is required', 400);
      }
      const { startDate, endDate } = queryTeacherAttendanceSchema.parse(req.query);

      const records = await teacherAttendanceService.getTeacherAttendanceHistory(
        teacherId,
        startDate,
        endDate
      );
      return successResponse(res, 'Teacher attendance history retrieved successfully.', { records });
    } catch (error) {
      next(error);
    }
  };

  public getMonthlyRegister = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { month, year } = queryTeacherAttendanceSchema.parse(req.query);

      if (!month || !year) {
        throw new AppError('month and year are required query parameters', 400);
      }

      const register = await teacherAttendanceService.getMonthlyRegister(month, year);
      return successResponse(res, 'Monthly teacher attendance register compiled successfully.', { register });
    } catch (error) {
      next(error);
    }
  };

  public exportMonthlyRegisterCSV = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { month, year } = queryTeacherAttendanceSchema.parse(req.query);

      if (!month || !year) {
        throw new AppError('month and year are required query parameters', 400);
      }

      const register = await teacherAttendanceService.getMonthlyRegister(month, year);
      const daysInMonth = new Date(year, month, 0).getDate();
      const csvData = compileTeacherRegisterCSV(register, daysInMonth);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="teacher-attendance-register-${year}-${month}.csv"`);
      return res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  };

  public getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await teacherAttendanceService.getDashboardStats();
      return successResponse(res, 'Teacher attendance dashboard statistics retrieved successfully.', { stats });
    } catch (error) {
      next(error);
    }
  };
}

function compileTeacherRegisterCSV(register: any[], daysInMonth: number): string {
  const headers = ['Employee ID', 'Full Name'];
  for (let i = 1; i <= daysInMonth; i++) {
    headers.push(`Day ${i}`);
  }
  headers.push('Present', 'Absent', 'Late', 'Half Day', 'Leave', 'Percentage');

  const rows = [headers.join(',')];
  register.forEach((row) => {
    const line = [
      row.employeeId,
      `"${row.fullName.replace(/"/g, '""')}"`,
    ];
    for (let i = 1; i <= daysInMonth; i++) {
      line.push(row.days[i] || '-');
    }
    line.push(
      row.stats.present,
      row.stats.absent,
      row.stats.late,
      row.stats.halfDay,
      row.stats.leave,
      `${row.stats.percentage}%`
    );
    rows.push(line.join(','));
  });

  return rows.join('\n');
}

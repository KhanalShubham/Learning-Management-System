import { prisma } from '@/prisma/client';
import { AppError } from '@/middleware/error.middleware';
import { AuditAction, TeacherAttendance } from '@prisma/client';
import { writeAuditLog } from '@/utils/audit-log';
import { ITeacherAttendanceRepository } from './teacher-attendance.repository';
import { AttendanceConfigService } from './attendance-config.service';

const configService = new AttendanceConfigService();

export class TeacherAttendanceService {
  constructor(private teacherAttendanceRepo: ITeacherAttendanceRepository) {}

  public async markAttendance(
    userId: string,
    data: {
      date: string;
      records: Array<{ teacherId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE'; remarks?: string | null }>;
    },
    userPermissions: string[]
  ): Promise<TeacherAttendance[]> {
    // 1. Parse Date to UTC Midnight
    const date = new Date(`${data.date}T00:00:00Z`);
    if (isNaN(date.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    // 2. Validate Calendar Restrictions (Weekend / Holidays)
    const calendarCheck = await configService.isHolidayOrWeekend(date);
    if (calendarCheck.isBlocked) {
      throw new AppError(`Cannot mark attendance: ${calendarCheck.reason}`, 400);
    }

    // 3. Validate Session Lock Constraints (sectionId = null scopes teacher locks)
    const isLocked = await configService.checkLockState(date, null);
    if (isLocked) {
      const hasBypass = userPermissions.includes('*') || userPermissions.includes('attendance.teacher.mark');
      if (!hasBypass) {
        throw new AppError(
          'This teacher attendance session is locked and cannot be edited. Please request an unlock from the administrator.',
          403
        );
      }
    }

    // 4. Verify Teachers Existence & Status
    const teacherIds = data.records.map((rec) => rec.teacherId);
    const teachers = await prisma.teacher.findMany({
      where: {
        id: { in: teacherIds },
      },
    });

    const foundTeacherIds = teachers.map((t) => t.id);
    const invalidTeacherIds = teacherIds.filter((id) => !foundTeacherIds.includes(id));
    if (invalidTeacherIds.length > 0) {
      throw new AppError(
        `The following teacher IDs do not exist in the database: ${invalidTeacherIds.join(', ')}`,
        400
      );
    }

    // 5. Map records to DB shape
    const attendanceRecords = data.records.map((rec) => ({
      teacherId: rec.teacherId,
      date,
      status: rec.status,
      remarks: rec.remarks || null,
      markedById: userId,
    }));

    // 6. Check if database entries exist on this date for audit action type selection
    const existing = await prisma.teacherAttendance.findFirst({
      where: {
        date,
      },
    });
    const action = existing ? AuditAction.TEACHER_ATTENDANCE_UPDATED : AuditAction.TEACHER_ATTENDANCE_MARKED;

    // 7. Bulk Upsert in Repository
    const result = await this.teacherAttendanceRepo.upsertBulk(attendanceRecords);

    // 8. Write audit log entry
    await writeAuditLog({
      userId,
      action,
      entityType: 'TeacherAttendance',
      details: `Teacher attendance ${existing ? 'updated' : 'marked'} for ${data.records.length} teacher(s) on date ${data.date}`,
    });

    return result;
  }

  public async getDailyAttendance(dateStr: string): Promise<TeacherAttendance[]> {
    const date = new Date(`${dateStr}T00:00:00Z`);
    if (isNaN(date.getTime())) {
      throw new AppError('Invalid date format', 400);
    }
    return this.teacherAttendanceRepo.findDaily(date);
  }

  public async getTeacherAttendanceHistory(
    teacherId: string,
    startDateStr?: string,
    endDateStr?: string
  ): Promise<TeacherAttendance[]> {
    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }

    const where: any = { teacherId };

    if (startDateStr || endDateStr) {
      where.date = {};
      if (startDateStr) {
        const start = new Date(`${startDateStr}T00:00:00Z`);
        if (isNaN(start.getTime())) throw new AppError('Invalid startDate format', 400);
        where.date.gte = start;
      }
      if (endDateStr) {
        const end = new Date(`${endDateStr}T00:00:00Z`);
        if (isNaN(end.getTime())) throw new AppError('Invalid endDate format', 400);
        where.date.lte = end;
      }
    }

    return this.teacherAttendanceRepo.findMany(where);
  }

  public async getMonthlyRegister(month: number, year: number) {
    const activeTeachers = await prisma.teacher.findMany({
      where: { status: TeacherStatusActiveBypass() },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        middleName: true,
        lastName: true,
      },
      orderBy: { firstName: 'asc' },
    });

    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const attendanceRecords = await prisma.teacherAttendance.findMany({
      where: {
        teacherId: { in: activeTeachers.map((t) => t.id) },
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    return activeTeachers.map((teacher) => {
      const teacherRecords = attendanceRecords.filter((r) => r.teacherId === teacher.id);

      const days: Record<number, string> = {};
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let halfDayCount = 0;
      let leaveCount = 0;

      teacherRecords.forEach((r) => {
        const day = r.date.getUTCDate();
        days[day] = r.status;
        if (r.status === 'PRESENT') presentCount++;
        else if (r.status === 'ABSENT') absentCount++;
        else if (r.status === 'LATE') lateCount++;
        else if (r.status === 'HALF_DAY') halfDayCount++;
        else if (r.status === 'ON_LEAVE') leaveCount++;
      });

      const totalMarked = teacherRecords.length;
      const presentPercentage = totalMarked > 0 ? Math.round(((presentCount + lateCount + halfDayCount * 0.5 + leaveCount) / totalMarked) * 100) : 100;

      return {
        teacherId: teacher.id,
        employeeId: teacher.employeeId,
        fullName: `${teacher.firstName}${teacher.middleName ? ' ' + teacher.middleName : ''} ${teacher.lastName}`,
        days,
        stats: {
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          halfDay: halfDayCount,
          leave: leaveCount,
          percentage: presentPercentage,
        },
      };
    });
  }

  public async getDashboardStats() {
    const today = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z');

    const totalTeachers = await prisma.teacher.count({ where: { status: TeacherStatusActiveBypass() } });

    const attendanceToday = await prisma.teacherAttendance.findMany({
      where: { date: today },
      include: {
        teacher: {
          select: {
            employeeId: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
    });

    const totalMarked = attendanceToday.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let halfDay = 0;
    let leave = 0;
    const recentAbsentees: any[] = [];

    attendanceToday.forEach((r) => {
      if (r.status === 'PRESENT') present++;
      else if (r.status === 'ABSENT') {
        absent++;
        recentAbsentees.push({
          teacherId: r.teacherId,
          employeeId: r.teacher.employeeId,
          fullName: `${r.teacher.firstName}${r.teacher.middleName ? ' ' + r.teacher.middleName : ''} ${r.teacher.lastName}`,
          remarks: r.remarks,
        });
      }
      else if (r.status === 'LATE') late++;
      else if (r.status === 'HALF_DAY') halfDay++;
      else if (r.status === 'ON_LEAVE') leave++;
    });

    return {
      date: today.toISOString().split('T')[0],
      totalTeachers,
      markedTeachersCount: totalMarked,
      stats: {
        present,
        absent,
        late,
        halfDay,
        leave,
        attendancePercentage: totalMarked > 0 ? Math.round(((present + late + halfDay * 0.5 + leave) / totalMarked) * 100) : 100,
      },
      recentAbsentees: recentAbsentees.slice(0, 10),
    };
  }
}

// Bypasses string type compatibility checks against TeacherStatus in prisma client
function TeacherStatusActiveBypass(): any {
  return 'ACTIVE';
}

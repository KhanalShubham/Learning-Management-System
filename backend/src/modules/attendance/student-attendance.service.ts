import { prisma } from '@/prisma/client';
import { AppError } from '@/middleware/error.middleware';
import { AuditAction, StudentAttendance } from '@prisma/client';
import { writeAuditLog } from '@/utils/audit-log';
import { IStudentAttendanceRepository } from './student-attendance.repository';
import { AttendanceConfigService } from './attendance-config.service';

const configService = new AttendanceConfigService();

export class StudentAttendanceService {
  constructor(private studentAttendanceRepo: IStudentAttendanceRepository) {}

  public async markAttendance(
    userId: string,
    data: {
      academicYearId: string;
      classId: string;
      sectionId: string;
      date: string;
      records: Array<{ studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY'; remarks?: string | null }>;
    },
    userPermissions: string[]
  ): Promise<StudentAttendance[]> {
    // 1. Parse Date to UTC Midnight (prevent local offset adjustments)
    const date = new Date(`${data.date}T00:00:00Z`);
    if (isNaN(date.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    // 2. Validate Calendar Restrictions (Weekend / Holidays)
    const calendarCheck = await configService.isHolidayOrWeekend(date);
    if (calendarCheck.isBlocked) {
      throw new AppError(`Cannot mark attendance: ${calendarCheck.reason}`, 400);
    }

    // 3. Validate Session Lock Constraints
    const isLocked = await configService.checkLockState(date, data.sectionId);
    if (isLocked) {
      const hasBypass = userPermissions.includes('*') || userPermissions.includes('attendance.teacher.mark');
      if (!hasBypass) {
        throw new AppError(
          'This attendance session is locked and cannot be edited. Please request an unlock from the administrator.',
          403
        );
      }
    }

    // 4. Validate Academic Year
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: data.academicYearId },
    });
    if (!academicYear) {
      throw new AppError('Academic year not found', 404);
    }

    // 5. Validate Class and check academic year binding
    const classRecord = await prisma.class.findUnique({
      where: { id: data.classId },
    });
    if (!classRecord) {
      throw new AppError('Class not found', 404);
    }
    if (classRecord.academicYearId !== data.academicYearId) {
      throw new AppError('Class does not belong to the selected academic year', 400);
    }

    // 6. Validate Section and check class binding
    const sectionRecord = await prisma.section.findUnique({
      where: { id: data.sectionId },
    });
    if (!sectionRecord) {
      throw new AppError('Section not found', 404);
    }
    if (sectionRecord.classId !== data.classId) {
      throw new AppError('Section does not belong to the selected class', 400);
    }

    // 7. Verify Student Enrollments
    const studentIds = data.records.map((rec) => rec.studentId);
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: { in: studentIds },
        academicYearId: data.academicYearId,
        classId: data.classId,
        sectionId: data.sectionId,
      },
    });

    const enrolledStudentIds = enrollments.map((e) => e.studentId);
    const invalidStudentIds = studentIds.filter((id) => !enrolledStudentIds.includes(id));
    if (invalidStudentIds.length > 0) {
      throw new AppError(
        `The following students are not active enrollments for this class/section: ${invalidStudentIds.join(', ')}`,
        400
      );
    }

    // 8. Map records to DB shape
    const attendanceRecords = data.records.map((rec) => ({
      studentId: rec.studentId,
      academicYearId: data.academicYearId,
      classId: data.classId,
      sectionId: data.sectionId,
      date,
      status: rec.status,
      remarks: rec.remarks || null,
      markedById: userId,
    }));

    // 9. Check if database entries exist on this date for audit action type selection
    const existing = await prisma.studentAttendance.findFirst({
      where: {
        date,
        classId: data.classId,
        sectionId: data.sectionId,
        academicYearId: data.academicYearId,
      },
    });
    const action = existing ? AuditAction.STUDENT_ATTENDANCE_UPDATED : AuditAction.STUDENT_ATTENDANCE_MARKED;

    // 10. Bulk Upsert in Repository
    const result = await this.studentAttendanceRepo.upsertBulk(attendanceRecords);

    // 11. Write audit log entry
    await writeAuditLog({
      userId,
      action,
      entityType: 'StudentAttendance',
      details: `Attendance ${existing ? 'updated' : 'marked'} for class '${classRecord.name}', section '${sectionRecord.name}' on date ${data.date}. Total records: ${data.records.length}`,
    });

    return result;
  }

  public async getDailyAttendance(
    dateStr: string,
    classId: string,
    sectionId: string,
    academicYearId: string
  ): Promise<StudentAttendance[]> {
    const date = new Date(`${dateStr}T00:00:00Z`);
    if (isNaN(date.getTime())) {
      throw new AppError('Invalid date format', 400);
    }
    return this.studentAttendanceRepo.findDaily(date, classId, sectionId, academicYearId);
  }

  public async getStudentAttendanceHistory(
    studentId: string,
    startDateStr?: string,
    endDateStr?: string
  ): Promise<StudentAttendance[]> {
    const where: any = { studentId };

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

    return this.studentAttendanceRepo.findMany(where);
  }

  public async getMonthlyRegister(
    academicYearId: string,
    classId: string,
    sectionId: string,
    month: number,
    year: number
  ) {
    const studentsEnrolled = await prisma.enrollment.findMany({
      where: {
        classId,
        sectionId,
        academicYearId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            admissionNumber: true,
          },
        },
      },
      orderBy: {
        rollNumber: 'asc',
      },
    });

    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const attendanceRecords = await prisma.studentAttendance.findMany({
      where: {
        studentId: { in: studentsEnrolled.map((e) => e.studentId) },
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    return studentsEnrolled.map((enrollment) => {
      const student = enrollment.student;
      const studentRecords = attendanceRecords.filter((r) => r.studentId === student.id);

      const days: Record<number, string> = {};
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let halfDayCount = 0;

      studentRecords.forEach((r) => {
        const day = r.date.getUTCDate();
        days[day] = r.status;
        if (r.status === 'PRESENT') presentCount++;
        else if (r.status === 'ABSENT') absentCount++;
        else if (r.status === 'LATE') lateCount++;
        else if (r.status === 'HALF_DAY') halfDayCount++;
      });

      const totalMarked = studentRecords.length;
      const presentPercentage = totalMarked > 0 ? Math.round(((presentCount + lateCount + halfDayCount * 0.5) / totalMarked) * 100) : 100;

      return {
        studentId: student.id,
        rollNumber: enrollment.rollNumber,
        fullName: `${student.firstName}${student.middleName ? ' ' + student.middleName : ''} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        days,
        stats: {
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          halfDay: halfDayCount,
          percentage: presentPercentage,
        },
      };
    });
  }

  public async getDashboardStats() {
    const today = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z');

    const totalSections = await prisma.section.count({ where: { status: RecordStatusActiveBypass() } });

    const attendanceToday = await prisma.studentAttendance.findMany({
      where: { date: today },
      include: {
        student: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            admissionNumber: true,
          },
        },
        class: { select: { name: true } },
        section: { select: { name: true } },
      },
    });

    const totalMarked = attendanceToday.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let halfDay = 0;
    const recentAbsentees: any[] = [];

    attendanceToday.forEach((r) => {
      if (r.status === 'PRESENT') present++;
      else if (r.status === 'ABSENT') {
        absent++;
        recentAbsentees.push({
          studentId: r.studentId,
          fullName: `${r.student.firstName}${r.student.middleName ? ' ' + r.student.middleName : ''} ${r.student.lastName}`,
          admissionNumber: r.student.admissionNumber,
          className: r.class.name,
          sectionName: r.section.name,
          remarks: r.remarks,
        });
      }
      else if (r.status === 'LATE') late++;
      else if (r.status === 'HALF_DAY') halfDay++;
    });

    const markedSectionIds = Array.from(new Set(attendanceToday.map((r) => r.sectionId)));
    const markedSections = markedSectionIds.length;

    return {
      date: today.toISOString().split('T')[0],
      totalSections,
      markedSections,
      pendingSections: Math.max(0, totalSections - markedSections),
      stats: {
        totalMarked,
        present,
        absent,
        late,
        halfDay,
        attendancePercentage: totalMarked > 0 ? Math.round(((present + late + halfDay * 0.5) / totalMarked) * 100) : 100,
      },
      recentAbsentees: recentAbsentees.slice(0, 10),
    };
  }
}

// Bypasses string type compatibility checks against RecordStatus in prisma client
function RecordStatusActiveBypass(): any {
  return 'ACTIVE';
}

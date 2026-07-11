import { prisma } from '@/prisma/client';
import { TeacherAttendance, Prisma } from '@prisma/client';

export interface ITeacherAttendanceRepository {
  upsertBulk(records: Prisma.TeacherAttendanceUncheckedCreateInput[]): Promise<TeacherAttendance[]>;
  findMany(where: Prisma.TeacherAttendanceWhereInput): Promise<TeacherAttendance[]>;
  findDaily(date: Date): Promise<TeacherAttendance[]>;
}

export class TeacherAttendanceRepository implements ITeacherAttendanceRepository {
  public async upsertBulk(
    records: Prisma.TeacherAttendanceUncheckedCreateInput[]
  ): Promise<TeacherAttendance[]> {
    return prisma.$transaction(
      records.map((rec) =>
        prisma.teacherAttendance.upsert({
          where: {
            teacherId_date: {
              teacherId: rec.teacherId,
              date: rec.date,
            },
          },
          update: {
            status: rec.status,
            remarks: rec.remarks,
            markedById: rec.markedById,
          },
          create: rec,
        })
      )
    );
  }

  public async findMany(where: Prisma.TeacherAttendanceWhereInput): Promise<TeacherAttendance[]> {
    return prisma.teacherAttendance.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            status: true,
          },
        },
        markedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        teacher: {
          firstName: 'asc',
        },
      },
    });
  }

  public async findDaily(date: Date): Promise<TeacherAttendance[]> {
    return prisma.teacherAttendance.findMany({
      where: {
        date,
      },
      include: {
        teacher: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            status: true,
          },
        },
        markedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        teacher: {
          firstName: 'asc',
        },
      },
    });
  }
}

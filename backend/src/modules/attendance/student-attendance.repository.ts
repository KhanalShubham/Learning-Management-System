import { prisma } from '@/prisma/client';
import { StudentAttendance, Prisma } from '@prisma/client';

export interface IStudentAttendanceRepository {
  upsertBulk(records: Prisma.StudentAttendanceUncheckedCreateInput[]): Promise<StudentAttendance[]>;
  findMany(where: Prisma.StudentAttendanceWhereInput): Promise<StudentAttendance[]>;
  findDaily(date: Date, classId: string, sectionId: string, academicYearId: string): Promise<StudentAttendance[]>;
}

export class StudentAttendanceRepository implements IStudentAttendanceRepository {
  public async upsertBulk(
    records: Prisma.StudentAttendanceUncheckedCreateInput[]
  ): Promise<StudentAttendance[]> {
    return prisma.$transaction(
      records.map((rec) =>
        prisma.studentAttendance.upsert({
          where: {
            studentId_date: {
              studentId: rec.studentId,
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

  public async findMany(where: Prisma.StudentAttendanceWhereInput): Promise<StudentAttendance[]> {
    return prisma.studentAttendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            admissionNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,
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
        student: {
          firstName: 'asc',
        },
      },
    });
  }

  public async findDaily(
    date: Date,
    classId: string,
    sectionId: string,
    academicYearId: string
  ): Promise<StudentAttendance[]> {
    return prisma.studentAttendance.findMany({
      where: {
        date,
        classId,
        sectionId,
        academicYearId,
      },
      include: {
        student: {
          select: {
            id: true,
            admissionNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,
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
        student: {
          firstName: 'asc',
        },
      },
    });
  }
}

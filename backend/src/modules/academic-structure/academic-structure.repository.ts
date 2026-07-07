import { prisma } from '@/prisma/client';
import { AcademicYear, Class, ExamType, RecordStatus, Section, Subject, ClassSubject } from '@prisma/client';

export type ClassWithDetails = Class & {
  sections: Section[];
  classSubjects: Array<ClassSubject & { subject: Subject }>;
};

export interface IAcademicStructureRepository {
  findAcademicYear(academicYearId?: string): Promise<AcademicYear | null>;
  findClassesWithDetails(academicYearId: string): Promise<ClassWithDetails[]>;
  findActiveSubjects(): Promise<Subject[]>;
  findExamTypes(academicYearId: string): Promise<ExamType[]>;
}

export class AcademicStructureRepository implements IAcademicStructureRepository {
  public async findAcademicYear(academicYearId?: string): Promise<AcademicYear | null> {
    if (academicYearId) {
      return prisma.academicYear.findUnique({ where: { id: academicYearId } });
    }
    return prisma.academicYear.findFirst({ where: { isCurrent: true } });
  }

  public async findClassesWithDetails(academicYearId: string): Promise<ClassWithDetails[]> {
    return prisma.class.findMany({
      where: { academicYearId, status: RecordStatus.ACTIVE },
      orderBy: { displayOrder: 'asc' },
      include: {
        sections: { where: { status: RecordStatus.ACTIVE }, orderBy: { name: 'asc' } },
        classSubjects: {
          include: { subject: true },
          orderBy: { subject: { name: 'asc' } },
        },
      },
    });
  }

  public async findActiveSubjects(): Promise<Subject[]> {
    return prisma.subject.findMany({
      where: { status: RecordStatus.ACTIVE },
      orderBy: { name: 'asc' },
    });
  }

  public async findExamTypes(academicYearId: string): Promise<ExamType[]> {
    return prisma.examType.findMany({
      where: { academicYearId, status: RecordStatus.ACTIVE },
      orderBy: { displayOrder: 'asc' },
    });
  }
}

import { prisma } from '@/prisma/client';
import { ExamType, Prisma, RecordStatus } from '@prisma/client';

export interface IExamTypeRepository {
  create(data: Prisma.ExamTypeCreateInput): Promise<ExamType>;
  findById(id: string): Promise<ExamType | null>;
  findByAcademicYearAndName(academicYearId: string, name: string): Promise<ExamType | null>;
  findAll(academicYearId?: string, includeArchived?: boolean): Promise<ExamType[]>;
  update(id: string, data: Prisma.ExamTypeUpdateInput): Promise<ExamType>;
  archive(id: string): Promise<ExamType>;
  delete(id: string): Promise<ExamType>;
}

export class ExamTypeRepository implements IExamTypeRepository {
  public async create(data: Prisma.ExamTypeCreateInput): Promise<ExamType> {
    return prisma.examType.create({ data });
  }

  public async findById(id: string): Promise<ExamType | null> {
    return prisma.examType.findUnique({ where: { id } });
  }

  public async findByAcademicYearAndName(
    academicYearId: string,
    name: string
  ): Promise<ExamType | null> {
    return prisma.examType.findUnique({
      where: { academicYearId_name: { academicYearId, name } },
    });
  }

  public async findAll(academicYearId?: string, includeArchived = false): Promise<ExamType[]> {
    return prisma.examType.findMany({
      where: {
        ...(academicYearId ? { academicYearId } : {}),
        ...(includeArchived ? {} : { status: RecordStatus.ACTIVE }),
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  public async update(id: string, data: Prisma.ExamTypeUpdateInput): Promise<ExamType> {
    return prisma.examType.update({ where: { id }, data });
  }

  public async archive(id: string): Promise<ExamType> {
    return prisma.examType.update({ where: { id }, data: { status: RecordStatus.ARCHIVED } });
  }

  public async delete(id: string): Promise<ExamType> {
    return prisma.examType.delete({ where: { id } });
  }
}

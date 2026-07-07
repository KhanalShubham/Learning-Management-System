import { prisma } from '@/prisma/client';
import { Class, Prisma, RecordStatus } from '@prisma/client';

export interface IClassRepository {
  create(data: Prisma.ClassCreateInput): Promise<Class>;
  findById(id: string): Promise<Class | null>;
  findByAcademicYearAndName(academicYearId: string, name: string): Promise<Class | null>;
  findAll(academicYearId?: string, includeArchived?: boolean): Promise<Class[]>;
  update(id: string, data: Prisma.ClassUpdateInput): Promise<Class>;
  archive(id: string): Promise<Class>;
  delete(id: string): Promise<Class>;
  countSections(id: string): Promise<number>;
  countClassSubjects(id: string): Promise<number>;
}

export class ClassRepository implements IClassRepository {
  public async create(data: Prisma.ClassCreateInput): Promise<Class> {
    return prisma.class.create({ data });
  }

  public async findById(id: string): Promise<Class | null> {
    return prisma.class.findUnique({ where: { id } });
  }

  public async findByAcademicYearAndName(
    academicYearId: string,
    name: string
  ): Promise<Class | null> {
    return prisma.class.findUnique({
      where: { academicYearId_name: { academicYearId, name } },
    });
  }

  public async findAll(academicYearId?: string, includeArchived = false): Promise<Class[]> {
    return prisma.class.findMany({
      where: {
        ...(academicYearId ? { academicYearId } : {}),
        ...(includeArchived ? {} : { status: RecordStatus.ACTIVE }),
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  public async update(id: string, data: Prisma.ClassUpdateInput): Promise<Class> {
    return prisma.class.update({ where: { id }, data });
  }

  public async archive(id: string): Promise<Class> {
    return prisma.class.update({ where: { id }, data: { status: RecordStatus.ARCHIVED } });
  }

  public async delete(id: string): Promise<Class> {
    return prisma.class.delete({ where: { id } });
  }

  public async countSections(id: string): Promise<number> {
    return prisma.section.count({ where: { classId: id } });
  }

  public async countClassSubjects(id: string): Promise<number> {
    return prisma.classSubject.count({ where: { classId: id } });
  }
}

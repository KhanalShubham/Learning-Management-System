import { prisma } from '@/prisma/client';
import { AcademicYear, Prisma } from '@prisma/client';

export interface IAcademicYearRepository {
  create(data: Prisma.AcademicYearCreateInput): Promise<AcademicYear>;
  findById(id: string): Promise<AcademicYear | null>;
  findByLabel(label: string): Promise<AcademicYear | null>;
  findAll(): Promise<AcademicYear[]>;
  update(id: string, data: Prisma.AcademicYearUpdateInput): Promise<AcademicYear>;
  delete(id: string): Promise<AcademicYear>;
  activate(id: string): Promise<AcademicYear>;
}

export class AcademicYearRepository implements IAcademicYearRepository {
  public async create(data: Prisma.AcademicYearCreateInput): Promise<AcademicYear> {
    return prisma.academicYear.create({ data });
  }

  public async findById(id: string): Promise<AcademicYear | null> {
    return prisma.academicYear.findUnique({ where: { id } });
  }

  public async findByLabel(label: string): Promise<AcademicYear | null> {
    return prisma.academicYear.findUnique({ where: { label } });
  }

  public async findAll(): Promise<AcademicYear[]> {
    return prisma.academicYear.findMany({ orderBy: { startDate: 'desc' } });
  }

  public async update(id: string, data: Prisma.AcademicYearUpdateInput): Promise<AcademicYear> {
    return prisma.academicYear.update({ where: { id }, data });
  }

  public async delete(id: string): Promise<AcademicYear> {
    return prisma.academicYear.delete({ where: { id } });
  }

  public async activate(id: string): Promise<AcademicYear> {
    const [, updated] = await prisma.$transaction([
      prisma.academicYear.updateMany({ data: { isCurrent: false }, where: { isCurrent: true } }),
      prisma.academicYear.update({ where: { id }, data: { isCurrent: true } }),
    ]);
    return updated;
  }
}

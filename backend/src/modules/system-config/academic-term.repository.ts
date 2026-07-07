import { prisma } from '@/prisma/client';
import { AcademicTerm, Prisma } from '@prisma/client';

export interface IAcademicTermRepository {
  create(data: Prisma.AcademicTermCreateInput): Promise<AcademicTerm>;
  findById(id: string): Promise<AcademicTerm | null>;
  findByName(name: string): Promise<AcademicTerm | null>;
  findAll(): Promise<AcademicTerm[]>;
  update(id: string, data: Prisma.AcademicTermUpdateInput): Promise<AcademicTerm>;
  delete(id: string): Promise<AcademicTerm>;
}

export class AcademicTermRepository implements IAcademicTermRepository {
  public async create(data: Prisma.AcademicTermCreateInput): Promise<AcademicTerm> {
    return prisma.academicTerm.create({ data });
  }

  public async findById(id: string): Promise<AcademicTerm | null> {
    return prisma.academicTerm.findUnique({ where: { id } });
  }

  public async findByName(name: string): Promise<AcademicTerm | null> {
    return prisma.academicTerm.findUnique({ where: { name } });
  }

  public async findAll(): Promise<AcademicTerm[]> {
    return prisma.academicTerm.findMany({ orderBy: { order: 'asc' } });
  }

  public async update(id: string, data: Prisma.AcademicTermUpdateInput): Promise<AcademicTerm> {
    return prisma.academicTerm.update({ where: { id }, data });
  }

  public async delete(id: string): Promise<AcademicTerm> {
    return prisma.academicTerm.delete({ where: { id } });
  }
}

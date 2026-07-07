import { prisma } from '@/prisma/client';
import { GradingScale, Prisma } from '@prisma/client';

export interface IGradingScaleRepository {
  create(data: Prisma.GradingScaleCreateInput): Promise<GradingScale>;
  findById(id: string): Promise<GradingScale | null>;
  findByGrade(grade: string): Promise<GradingScale | null>;
  findAll(): Promise<GradingScale[]>;
  findAllExcept(id: string): Promise<GradingScale[]>;
  update(id: string, data: Prisma.GradingScaleUpdateInput): Promise<GradingScale>;
  delete(id: string): Promise<GradingScale>;
}

export class GradingScaleRepository implements IGradingScaleRepository {
  public async create(data: Prisma.GradingScaleCreateInput): Promise<GradingScale> {
    return prisma.gradingScale.create({ data });
  }

  public async findById(id: string): Promise<GradingScale | null> {
    return prisma.gradingScale.findUnique({ where: { id } });
  }

  public async findByGrade(grade: string): Promise<GradingScale | null> {
    return prisma.gradingScale.findUnique({ where: { grade } });
  }

  public async findAll(): Promise<GradingScale[]> {
    return prisma.gradingScale.findMany({ orderBy: { order: 'asc' } });
  }

  public async findAllExcept(id: string): Promise<GradingScale[]> {
    return prisma.gradingScale.findMany({ where: { id: { not: id } } });
  }

  public async update(id: string, data: Prisma.GradingScaleUpdateInput): Promise<GradingScale> {
    return prisma.gradingScale.update({ where: { id }, data });
  }

  public async delete(id: string): Promise<GradingScale> {
    return prisma.gradingScale.delete({ where: { id } });
  }
}

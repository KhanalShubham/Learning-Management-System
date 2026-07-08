import { prisma } from '@/prisma/client';
import { Designation, Prisma, RecordStatus } from '@prisma/client';

export interface IDesignationRepository {
  create(data: Prisma.DesignationCreateInput): Promise<Designation>;
  findById(id: string): Promise<Designation | null>;
  findByName(name: string): Promise<Designation | null>;
  findAll(includeArchived?: boolean): Promise<Designation[]>;
  update(id: string, data: Prisma.DesignationUpdateInput): Promise<Designation>;
  archive(id: string): Promise<Designation>;
  delete(id: string): Promise<Designation>;
  countTeachers(id: string): Promise<number>;
}

export class DesignationRepository implements IDesignationRepository {
  public async create(data: Prisma.DesignationCreateInput): Promise<Designation> {
    return prisma.designation.create({ data });
  }

  public async findById(id: string): Promise<Designation | null> {
    return prisma.designation.findUnique({ where: { id } });
  }

  public async findByName(name: string): Promise<Designation | null> {
    return prisma.designation.findUnique({ where: { name } });
  }

  public async findAll(includeArchived = false): Promise<Designation[]> {
    return prisma.designation.findMany({
      where: includeArchived ? undefined : { status: RecordStatus.ACTIVE },
      orderBy: { displayOrder: 'asc' },
    });
  }

  public async update(id: string, data: Prisma.DesignationUpdateInput): Promise<Designation> {
    return prisma.designation.update({ where: { id }, data });
  }

  public async archive(id: string): Promise<Designation> {
    return prisma.designation.update({ where: { id }, data: { status: RecordStatus.ARCHIVED } });
  }

  public async delete(id: string): Promise<Designation> {
    return prisma.designation.delete({ where: { id } });
  }

  public async countTeachers(id: string): Promise<number> {
    return prisma.teacher.count({ where: { designationId: id } });
  }
}

import { prisma } from '@/prisma/client';
import { Department, Prisma, RecordStatus } from '@prisma/client';

export interface IDepartmentRepository {
  create(data: Prisma.DepartmentCreateInput): Promise<Department>;
  findById(id: string): Promise<Department | null>;
  findByNameOrCode(name: string, code?: string | null): Promise<Department | null>;
  findAll(includeArchived?: boolean): Promise<Department[]>;
  update(id: string, data: Prisma.DepartmentUpdateInput): Promise<Department>;
  archive(id: string): Promise<Department>;
  delete(id: string): Promise<Department>;
  countTeachers(id: string): Promise<number>;
}

export class DepartmentRepository implements IDepartmentRepository {
  public async create(data: Prisma.DepartmentCreateInput): Promise<Department> {
    return prisma.department.create({ data });
  }

  public async findById(id: string): Promise<Department | null> {
    return prisma.department.findUnique({ where: { id } });
  }

  public async findByNameOrCode(name: string, code?: string | null): Promise<Department | null> {
    return prisma.department.findFirst({
      where: {
        OR: [{ name }, ...(code ? [{ code }] : [])],
      },
    });
  }

  public async findAll(includeArchived = false): Promise<Department[]> {
    return prisma.department.findMany({
      where: includeArchived ? undefined : { status: RecordStatus.ACTIVE },
      orderBy: { name: 'asc' },
    });
  }

  public async update(id: string, data: Prisma.DepartmentUpdateInput): Promise<Department> {
    return prisma.department.update({ where: { id }, data });
  }

  public async archive(id: string): Promise<Department> {
    return prisma.department.update({ where: { id }, data: { status: RecordStatus.ARCHIVED } });
  }

  public async delete(id: string): Promise<Department> {
    return prisma.department.delete({ where: { id } });
  }

  public async countTeachers(id: string): Promise<number> {
    return prisma.teacher.count({ where: { departmentId: id } });
  }
}

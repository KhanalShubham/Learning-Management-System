import { prisma } from '@/prisma/client';
import { Role, Prisma } from '@prisma/client';

export interface IRoleRepository {
  create(data: Prisma.RoleCreateInput): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  update(id: string, data: Prisma.RoleUpdateInput): Promise<Role>;
  delete(id: string): Promise<Role>;
}

export class RoleRepository implements IRoleRepository {
  public async create(data: Prisma.RoleCreateInput): Promise<Role> {
    return prisma.role.create({ data });
  }

  public async findById(id: string): Promise<Role | null> {
    return prisma.role.findUnique({ 
      where: { id },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    });
  }

  public async findByName(name: string): Promise<Role | null> {
    return prisma.role.findUnique({ where: { name } });
  }

  public async findAll(): Promise<Role[]> {
    return prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    });
  }

  public async update(id: string, data: Prisma.RoleUpdateInput): Promise<Role> {
    return prisma.role.update({ where: { id }, data });
  }

  public async delete(id: string): Promise<Role> {
    return prisma.role.delete({ where: { id } });
  }
}

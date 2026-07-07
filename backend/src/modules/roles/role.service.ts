import { Prisma, Role } from '@prisma/client';
import { IRoleRepository } from './role.repository';
import { AppError } from '@/middleware/error.middleware';

export class RoleService {
  constructor(private roleRepository: IRoleRepository) {}

  public async createRole(data: Prisma.RoleCreateInput): Promise<Role> {
    const existingRole = await this.roleRepository.findByName(data.name);
    if (existingRole) {
      throw new AppError('Role with this name already exists', 409);
    }
    return this.roleRepository.create(data);
  }

  public async getRoleById(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    return role;
  }

  public async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  public async updateRole(id: string, data: Prisma.RoleUpdateInput): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    if (data.name) {
      const existingRole = await this.roleRepository.findByName(data.name as string);
      if (existingRole && existingRole.id !== id) {
        throw new AppError('Role name is already in use', 409);
      }
    }

    return this.roleRepository.update(id, data);
  }

  public async deleteRole(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    try {
      return await this.roleRepository.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new AppError('Cannot delete role: it is still assigned to one or more users', 409);
      }
      throw error;
    }
  }
}

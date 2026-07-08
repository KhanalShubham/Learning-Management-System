import { Department, Prisma } from '@prisma/client';
import { IDepartmentRepository } from './department.repository';
import { AppError } from '@/middleware/error.middleware';

export class DepartmentService {
  constructor(private departmentRepository: IDepartmentRepository) {}

  public async createDepartment(data: Prisma.DepartmentCreateInput): Promise<Department> {
    const existing = await this.departmentRepository.findByNameOrCode(data.name, data.code);
    if (existing) {
      throw new AppError('A department with this name or code already exists', 409);
    }
    return this.departmentRepository.create(data);
  }

  public async getDepartmentById(id: string): Promise<Department> {
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new AppError('Department not found', 404);
    }
    return department;
  }

  public async getAllDepartments(includeArchived?: boolean): Promise<Department[]> {
    return this.departmentRepository.findAll(includeArchived);
  }

  public async updateDepartment(id: string, data: Prisma.DepartmentUpdateInput): Promise<Department> {
    const department = await this.getDepartmentById(id);

    if (data.name || data.code) {
      const existing = await this.departmentRepository.findByNameOrCode(
        (data.name as string) ?? department.name,
        data.code !== undefined ? (data.code as string | null) : department.code
      );
      if (existing && existing.id !== id) {
        throw new AppError('A department with this name or code already exists', 409);
      }
    }

    return this.departmentRepository.update(id, data);
  }

  public async archiveDepartment(id: string): Promise<Department> {
    await this.getDepartmentById(id);
    return this.departmentRepository.archive(id);
  }

  public async deleteDepartment(id: string): Promise<Department> {
    await this.getDepartmentById(id);
    const teacherCount = await this.departmentRepository.countTeachers(id);
    if (teacherCount > 0) {
      throw new AppError(
        'Department has one or more teachers assigned; archive it instead of deleting',
        409
      );
    }
    return this.departmentRepository.delete(id);
  }
}

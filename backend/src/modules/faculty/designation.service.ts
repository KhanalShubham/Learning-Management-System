import { Designation, Prisma } from '@prisma/client';
import { IDesignationRepository } from './designation.repository';
import { AppError } from '@/middleware/error.middleware';

export class DesignationService {
  constructor(private designationRepository: IDesignationRepository) {}

  public async createDesignation(data: Prisma.DesignationCreateInput): Promise<Designation> {
    const existing = await this.designationRepository.findByName(data.name);
    if (existing) {
      throw new AppError('A designation with this name already exists', 409);
    }
    return this.designationRepository.create(data);
  }

  public async getDesignationById(id: string): Promise<Designation> {
    const designation = await this.designationRepository.findById(id);
    if (!designation) {
      throw new AppError('Designation not found', 404);
    }
    return designation;
  }

  public async getAllDesignations(includeArchived?: boolean): Promise<Designation[]> {
    return this.designationRepository.findAll(includeArchived);
  }

  public async updateDesignation(id: string, data: Prisma.DesignationUpdateInput): Promise<Designation> {
    await this.getDesignationById(id);

    if (data.name) {
      const existing = await this.designationRepository.findByName(data.name as string);
      if (existing && existing.id !== id) {
        throw new AppError('A designation with this name already exists', 409);
      }
    }

    return this.designationRepository.update(id, data);
  }

  public async archiveDesignation(id: string): Promise<Designation> {
    await this.getDesignationById(id);
    return this.designationRepository.archive(id);
  }

  public async deleteDesignation(id: string): Promise<Designation> {
    await this.getDesignationById(id);
    const teacherCount = await this.designationRepository.countTeachers(id);
    if (teacherCount > 0) {
      throw new AppError(
        'Designation has one or more teachers assigned; archive it instead of deleting',
        409
      );
    }
    return this.designationRepository.delete(id);
  }
}

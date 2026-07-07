import { AcademicYear, Prisma } from '@prisma/client';
import { IAcademicYearRepository } from './academic-year.repository';
import { AppError } from '@/middleware/error.middleware';

export class AcademicYearService {
  constructor(private academicYearRepository: IAcademicYearRepository) {}

  public async createAcademicYear(data: Prisma.AcademicYearCreateInput): Promise<AcademicYear> {
    const existing = await this.academicYearRepository.findByLabel(data.label);
    if (existing) {
      throw new AppError('An academic year with this label already exists', 409);
    }
    return this.academicYearRepository.create(data);
  }

  public async getAcademicYearById(id: string): Promise<AcademicYear> {
    const year = await this.academicYearRepository.findById(id);
    if (!year) {
      throw new AppError('Academic year not found', 404);
    }
    return year;
  }

  public async getAllAcademicYears(): Promise<AcademicYear[]> {
    return this.academicYearRepository.findAll();
  }

  public async updateAcademicYear(
    id: string,
    data: Prisma.AcademicYearUpdateInput
  ): Promise<AcademicYear> {
    await this.getAcademicYearById(id);

    if (data.label) {
      const existing = await this.academicYearRepository.findByLabel(data.label as string);
      if (existing && existing.id !== id) {
        throw new AppError('An academic year with this label already exists', 409);
      }
    }

    return this.academicYearRepository.update(id, data);
  }

  public async deleteAcademicYear(id: string): Promise<AcademicYear> {
    const year = await this.getAcademicYearById(id);
    if (year.isCurrent) {
      throw new AppError('Cannot delete the current academic year', 409);
    }
    return this.academicYearRepository.delete(id);
  }

  public async activateAcademicYear(id: string): Promise<AcademicYear> {
    await this.getAcademicYearById(id);
    return this.academicYearRepository.activate(id);
  }
}

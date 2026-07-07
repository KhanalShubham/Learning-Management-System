import { AcademicTerm, Prisma } from '@prisma/client';
import { IAcademicTermRepository } from './academic-term.repository';
import { AppError } from '@/middleware/error.middleware';

export class AcademicTermService {
  constructor(private academicTermRepository: IAcademicTermRepository) {}

  public async createTerm(data: Prisma.AcademicTermCreateInput): Promise<AcademicTerm> {
    const existing = await this.academicTermRepository.findByName(data.name);
    if (existing) {
      throw new AppError('An academic term with this name already exists', 409);
    }
    return this.academicTermRepository.create(data);
  }

  public async getTermById(id: string): Promise<AcademicTerm> {
    const term = await this.academicTermRepository.findById(id);
    if (!term) {
      throw new AppError('Academic term not found', 404);
    }
    return term;
  }

  public async getAllTerms(): Promise<AcademicTerm[]> {
    return this.academicTermRepository.findAll();
  }

  public async updateTerm(id: string, data: Prisma.AcademicTermUpdateInput): Promise<AcademicTerm> {
    await this.getTermById(id);

    if (data.name) {
      const existing = await this.academicTermRepository.findByName(data.name as string);
      if (existing && existing.id !== id) {
        throw new AppError('An academic term with this name already exists', 409);
      }
    }

    return this.academicTermRepository.update(id, data);
  }

  public async deleteTerm(id: string): Promise<AcademicTerm> {
    await this.getTermById(id);
    return this.academicTermRepository.delete(id);
  }
}

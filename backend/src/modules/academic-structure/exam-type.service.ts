import { ExamType, Prisma } from '@prisma/client';
import { IExamTypeRepository } from './exam-type.repository';
import { AppError } from '@/middleware/error.middleware';

export interface CreateExamTypeInput {
  academicYearId: string;
  name: string;
  code?: string;
  description?: string;
  displayOrder: number;
  weightage: number;
  isPublished?: boolean;
}

export class ExamTypeService {
  constructor(private examTypeRepository: IExamTypeRepository) {}

  public async createExamType(data: CreateExamTypeInput): Promise<ExamType> {
    const existing = await this.examTypeRepository.findByAcademicYearAndName(
      data.academicYearId,
      data.name
    );
    if (existing) {
      throw new AppError('An exam type with this name already exists for this academic year', 409);
    }
    const { academicYearId, ...rest } = data;
    return this.examTypeRepository.create({
      ...rest,
      academicYear: { connect: { id: academicYearId } },
    });
  }

  public async getExamTypeById(id: string): Promise<ExamType> {
    const examType = await this.examTypeRepository.findById(id);
    if (!examType) {
      throw new AppError('Exam type not found', 404);
    }
    return examType;
  }

  public async getAllExamTypes(
    academicYearId?: string,
    includeArchived?: boolean
  ): Promise<ExamType[]> {
    return this.examTypeRepository.findAll(academicYearId, includeArchived);
  }

  public async updateExamType(id: string, data: Prisma.ExamTypeUpdateInput): Promise<ExamType> {
    const examType = await this.getExamTypeById(id);

    if (data.name) {
      const existing = await this.examTypeRepository.findByAcademicYearAndName(
        examType.academicYearId,
        data.name as string
      );
      if (existing && existing.id !== id) {
        throw new AppError(
          'An exam type with this name already exists for this academic year',
          409
        );
      }
    }

    return this.examTypeRepository.update(id, data);
  }

  public async archiveExamType(id: string): Promise<ExamType> {
    await this.getExamTypeById(id);
    return this.examTypeRepository.archive(id);
  }

  public async deleteExamType(id: string): Promise<ExamType> {
    await this.getExamTypeById(id);
    return this.examTypeRepository.delete(id);
  }
}

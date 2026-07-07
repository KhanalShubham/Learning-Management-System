import { GradingScale, Prisma } from '@prisma/client';
import { IGradingScaleRepository } from './grading-scale.repository';
import { AppError } from '@/middleware/error.middleware';

const rangesOverlap = (aMin: number, aMax: number, bMin: number, bMax: number): boolean =>
  aMin < bMax && bMin < aMax;

export class GradingScaleService {
  constructor(private gradingScaleRepository: IGradingScaleRepository) {}

  private async assertNoOverlap(
    minPercentage: number,
    maxPercentage: number,
    excludeId?: string
  ): Promise<void> {
    const others = excludeId
      ? await this.gradingScaleRepository.findAllExcept(excludeId)
      : await this.gradingScaleRepository.findAll();

    const overlapping = others.some((scale) =>
      rangesOverlap(minPercentage, maxPercentage, scale.minPercentage, scale.maxPercentage)
    );

    if (overlapping) {
      throw new AppError('This percentage range overlaps with an existing grading scale', 409);
    }
  }

  public async createScale(data: Prisma.GradingScaleCreateInput): Promise<GradingScale> {
    const existing = await this.gradingScaleRepository.findByGrade(data.grade);
    if (existing) {
      throw new AppError('A grading scale with this grade already exists', 409);
    }
    await this.assertNoOverlap(data.minPercentage, data.maxPercentage);
    return this.gradingScaleRepository.create(data);
  }

  public async getScaleById(id: string): Promise<GradingScale> {
    const scale = await this.gradingScaleRepository.findById(id);
    if (!scale) {
      throw new AppError('Grading scale not found', 404);
    }
    return scale;
  }

  public async getAllScales(): Promise<GradingScale[]> {
    return this.gradingScaleRepository.findAll();
  }

  public async updateScale(
    id: string,
    data: Prisma.GradingScaleUpdateInput
  ): Promise<GradingScale> {
    const existingScale = await this.getScaleById(id);

    if (data.grade) {
      const existing = await this.gradingScaleRepository.findByGrade(data.grade as string);
      if (existing && existing.id !== id) {
        throw new AppError('A grading scale with this grade already exists', 409);
      }
    }

    const minPercentage = (data.minPercentage as number) ?? existingScale.minPercentage;
    const maxPercentage = (data.maxPercentage as number) ?? existingScale.maxPercentage;
    if (data.minPercentage !== undefined || data.maxPercentage !== undefined) {
      await this.assertNoOverlap(minPercentage, maxPercentage, id);
    }

    return this.gradingScaleRepository.update(id, data);
  }

  public async deleteScale(id: string): Promise<GradingScale> {
    await this.getScaleById(id);
    return this.gradingScaleRepository.delete(id);
  }
}

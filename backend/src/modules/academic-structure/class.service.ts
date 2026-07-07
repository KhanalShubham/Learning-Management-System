import { Class, Prisma } from '@prisma/client';
import { IClassRepository } from './class.repository';
import { AppError } from '@/middleware/error.middleware';

export interface CreateClassInput {
  academicYearId: string;
  name: string;
  displayOrder: number;
  description?: string;
}

export class ClassService {
  constructor(private classRepository: IClassRepository) {}

  public async createClass(data: CreateClassInput): Promise<Class> {
    const existing = await this.classRepository.findByAcademicYearAndName(
      data.academicYearId,
      data.name
    );
    if (existing) {
      throw new AppError('A class with this name already exists for this academic year', 409);
    }
    const { academicYearId, ...rest } = data;
    return this.classRepository.create({
      ...rest,
      academicYear: { connect: { id: academicYearId } },
    });
  }

  public async getClassById(id: string): Promise<Class> {
    const cls = await this.classRepository.findById(id);
    if (!cls) {
      throw new AppError('Class not found', 404);
    }
    return cls;
  }

  public async getAllClasses(academicYearId?: string, includeArchived?: boolean): Promise<Class[]> {
    return this.classRepository.findAll(academicYearId, includeArchived);
  }

  public async updateClass(id: string, data: Prisma.ClassUpdateInput): Promise<Class> {
    const cls = await this.getClassById(id);

    if (data.name) {
      const existing = await this.classRepository.findByAcademicYearAndName(
        cls.academicYearId,
        data.name as string
      );
      if (existing && existing.id !== id) {
        throw new AppError('A class with this name already exists for this academic year', 409);
      }
    }

    return this.classRepository.update(id, data);
  }

  public async archiveClass(id: string): Promise<Class> {
    await this.getClassById(id);
    return this.classRepository.archive(id);
  }

  public async deleteClass(id: string): Promise<Class> {
    await this.getClassById(id);
    const [sectionCount, classSubjectCount] = await Promise.all([
      this.classRepository.countSections(id),
      this.classRepository.countClassSubjects(id),
    ]);
    if (sectionCount > 0 || classSubjectCount > 0) {
      throw new AppError(
        'Class has sections or subject allocations; archive it instead of deleting',
        409
      );
    }
    return this.classRepository.delete(id);
  }
}

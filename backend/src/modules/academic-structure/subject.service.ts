import { Subject, Prisma } from '@prisma/client';
import { ISubjectRepository } from './subject.repository';
import { AppError } from '@/middleware/error.middleware';

export class SubjectService {
  constructor(private subjectRepository: ISubjectRepository) {}

  public async createSubject(data: Prisma.SubjectCreateInput): Promise<Subject> {
    const existing = await this.subjectRepository.findByNameOrCode(data.name, data.code);
    if (existing) {
      throw new AppError('A subject with this name or code already exists', 409);
    }
    return this.subjectRepository.create(data);
  }

  public async getSubjectById(id: string): Promise<Subject> {
    const subject = await this.subjectRepository.findById(id);
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }
    return subject;
  }

  public async getAllSubjects(includeArchived?: boolean): Promise<Subject[]> {
    return this.subjectRepository.findAll(includeArchived);
  }

  public async updateSubject(id: string, data: Prisma.SubjectUpdateInput): Promise<Subject> {
    const subject = await this.getSubjectById(id);

    if (data.name || data.code) {
      const existing = await this.subjectRepository.findByNameOrCode(
        (data.name as string) ?? subject.name,
        data.code !== undefined ? (data.code as string | null) : subject.code
      );
      if (existing && existing.id !== id) {
        throw new AppError('A subject with this name or code already exists', 409);
      }
    }

    return this.subjectRepository.update(id, data);
  }

  public async archiveSubject(id: string): Promise<Subject> {
    await this.getSubjectById(id);
    return this.subjectRepository.archive(id);
  }

  public async deleteSubject(id: string): Promise<Subject> {
    await this.getSubjectById(id);
    const allocationCount = await this.subjectRepository.countClassSubjects(id);
    if (allocationCount > 0) {
      throw new AppError(
        'Subject is allocated to one or more classes; archive it instead of deleting',
        409
      );
    }
    return this.subjectRepository.delete(id);
  }
}

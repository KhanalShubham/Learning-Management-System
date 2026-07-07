import { Section, Prisma } from '@prisma/client';
import { ISectionRepository } from './section.repository';
import { AppError } from '@/middleware/error.middleware';

export interface CreateSectionInput {
  classId: string;
  name: string;
  capacity?: number;
  roomNumber?: string;
}

export class SectionService {
  constructor(private sectionRepository: ISectionRepository) {}

  public async createSection(data: CreateSectionInput): Promise<Section> {
    const existing = await this.sectionRepository.findByClassAndName(data.classId, data.name);
    if (existing) {
      throw new AppError('A section with this name already exists for this class', 409);
    }
    const { classId, ...rest } = data;
    return this.sectionRepository.create({
      ...rest,
      class: { connect: { id: classId } },
    });
  }

  public async getSectionById(id: string): Promise<Section> {
    const section = await this.sectionRepository.findById(id);
    if (!section) {
      throw new AppError('Section not found', 404);
    }
    return section;
  }

  public async getAllSections(classId?: string, includeArchived?: boolean): Promise<Section[]> {
    return this.sectionRepository.findAll(classId, includeArchived);
  }

  public async updateSection(id: string, data: Prisma.SectionUpdateInput): Promise<Section> {
    const section = await this.getSectionById(id);

    if (data.name) {
      const existing = await this.sectionRepository.findByClassAndName(
        section.classId,
        data.name as string
      );
      if (existing && existing.id !== id) {
        throw new AppError('A section with this name already exists for this class', 409);
      }
    }

    return this.sectionRepository.update(id, data);
  }

  public async archiveSection(id: string): Promise<Section> {
    await this.getSectionById(id);
    return this.sectionRepository.archive(id);
  }

  public async deleteSection(id: string): Promise<Section> {
    await this.getSectionById(id);
    return this.sectionRepository.delete(id);
  }
}

import { prisma } from '@/prisma/client';
import { Section, Prisma, RecordStatus } from '@prisma/client';

export interface ISectionRepository {
  create(data: Prisma.SectionCreateInput): Promise<Section>;
  findById(id: string): Promise<Section | null>;
  findByClassAndName(classId: string, name: string): Promise<Section | null>;
  findAll(classId?: string, includeArchived?: boolean): Promise<Section[]>;
  update(id: string, data: Prisma.SectionUpdateInput): Promise<Section>;
  archive(id: string): Promise<Section>;
  delete(id: string): Promise<Section>;
}

export class SectionRepository implements ISectionRepository {
  public async create(data: Prisma.SectionCreateInput): Promise<Section> {
    return prisma.section.create({ data });
  }

  public async findById(id: string): Promise<Section | null> {
    return prisma.section.findUnique({ where: { id } });
  }

  public async findByClassAndName(classId: string, name: string): Promise<Section | null> {
    return prisma.section.findUnique({
      where: { classId_name: { classId, name } },
    });
  }

  public async findAll(classId?: string, includeArchived = false): Promise<Section[]> {
    return prisma.section.findMany({
      where: {
        ...(classId ? { classId } : {}),
        ...(includeArchived ? {} : { status: RecordStatus.ACTIVE }),
      },
      orderBy: { name: 'asc' },
    });
  }

  public async update(id: string, data: Prisma.SectionUpdateInput): Promise<Section> {
    return prisma.section.update({ where: { id }, data });
  }

  public async archive(id: string): Promise<Section> {
    return prisma.section.update({ where: { id }, data: { status: RecordStatus.ARCHIVED } });
  }

  public async delete(id: string): Promise<Section> {
    return prisma.section.delete({ where: { id } });
  }
}

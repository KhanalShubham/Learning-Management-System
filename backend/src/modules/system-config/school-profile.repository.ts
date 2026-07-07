import { prisma } from '@/prisma/client';
import { SchoolProfile, Prisma } from '@prisma/client';

export interface ISchoolProfileRepository {
  getOrCreate(): Promise<SchoolProfile>;
  update(id: string, data: Prisma.SchoolProfileUpdateInput): Promise<SchoolProfile>;
}

export class SchoolProfileRepository implements ISchoolProfileRepository {
  public async getOrCreate(): Promise<SchoolProfile> {
    const existing = await prisma.schoolProfile.findFirst();
    if (existing) return existing;
    return prisma.schoolProfile.create({ data: {} });
  }

  public async update(id: string, data: Prisma.SchoolProfileUpdateInput): Promise<SchoolProfile> {
    return prisma.schoolProfile.update({ where: { id }, data });
  }
}

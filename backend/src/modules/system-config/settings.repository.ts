import { prisma } from '@/prisma/client';
import { SchoolSettings, Prisma } from '@prisma/client';

export interface ISettingsRepository {
  getOrCreate(): Promise<SchoolSettings>;
  update(id: string, data: Prisma.SchoolSettingsUpdateInput): Promise<SchoolSettings>;
}

export class SettingsRepository implements ISettingsRepository {
  public async getOrCreate(): Promise<SchoolSettings> {
    const existing = await prisma.schoolSettings.findFirst();
    if (existing) return existing;
    return prisma.schoolSettings.create({ data: {} });
  }

  public async update(id: string, data: Prisma.SchoolSettingsUpdateInput): Promise<SchoolSettings> {
    return prisma.schoolSettings.update({ where: { id }, data });
  }
}

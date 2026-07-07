import { prisma } from '@/prisma/client';
import { SchoolBranding, Prisma } from '@prisma/client';

export interface IBrandingRepository {
  getOrCreate(): Promise<SchoolBranding>;
  update(id: string, data: Prisma.SchoolBrandingUpdateInput): Promise<SchoolBranding>;
}

export class BrandingRepository implements IBrandingRepository {
  public async getOrCreate(): Promise<SchoolBranding> {
    const existing = await prisma.schoolBranding.findFirst();
    if (existing) return existing;
    return prisma.schoolBranding.create({ data: {} });
  }

  public async update(id: string, data: Prisma.SchoolBrandingUpdateInput): Promise<SchoolBranding> {
    return prisma.schoolBranding.update({ where: { id }, data });
  }
}

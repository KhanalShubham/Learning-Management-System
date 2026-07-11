import { prisma } from '@/prisma/client';
import { GalleryImage, Prisma, RecordStatus } from '@prisma/client';

export interface IGalleryRepository {
  create(data: Prisma.GalleryImageCreateInput): Promise<GalleryImage>;
  findById(id: string): Promise<GalleryImage | null>;
  findAll(includeArchived?: boolean): Promise<GalleryImage[]>;
  update(id: string, data: Prisma.GalleryImageUpdateInput): Promise<GalleryImage>;
  archive(id: string): Promise<GalleryImage>;
  delete(id: string): Promise<GalleryImage>;
  getMaxDisplayOrder(): Promise<number>;
}

export class GalleryRepository implements IGalleryRepository {
  public async create(data: Prisma.GalleryImageCreateInput): Promise<GalleryImage> {
    return prisma.galleryImage.create({ data });
  }

  public async findById(id: string): Promise<GalleryImage | null> {
    return prisma.galleryImage.findUnique({ where: { id } });
  }

  public async findAll(includeArchived = false): Promise<GalleryImage[]> {
    return prisma.galleryImage.findMany({
      where: includeArchived ? undefined : { status: RecordStatus.ACTIVE },
      orderBy: { displayOrder: 'asc' },
    });
  }

  public async update(id: string, data: Prisma.GalleryImageUpdateInput): Promise<GalleryImage> {
    return prisma.galleryImage.update({ where: { id }, data });
  }

  public async archive(id: string): Promise<GalleryImage> {
    return prisma.galleryImage.update({ where: { id }, data: { status: RecordStatus.ARCHIVED } });
  }

  public async delete(id: string): Promise<GalleryImage> {
    return prisma.galleryImage.delete({ where: { id } });
  }

  public async getMaxDisplayOrder(): Promise<number> {
    const last = await prisma.galleryImage.findFirst({ orderBy: { displayOrder: 'desc' }, select: { displayOrder: true } });
    return last?.displayOrder ?? 0;
  }
}

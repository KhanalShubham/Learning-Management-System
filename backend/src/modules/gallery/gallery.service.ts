import { GalleryImage } from '@prisma/client';
import { AppError } from '@/middleware/error.middleware';
import { IGalleryRepository } from './gallery.repository';

export interface AddGalleryImageData {
  imageUrl: string;
  caption?: string;
}

export interface UpdateGalleryImageData {
  caption?: string;
  displayOrder?: number;
}

export class GalleryService {
  constructor(private galleryRepository: IGalleryRepository) {}

  public async addImage(data: AddGalleryImageData): Promise<GalleryImage> {
    const maxOrder = await this.galleryRepository.getMaxDisplayOrder();
    return this.galleryRepository.create({ ...data, displayOrder: maxOrder + 1 });
  }

  public async getImageById(id: string): Promise<GalleryImage> {
    const image = await this.galleryRepository.findById(id);
    if (!image) {
      throw new AppError('Gallery image not found', 404);
    }
    return image;
  }

  public async getAllImages(includeArchived?: boolean): Promise<GalleryImage[]> {
    return this.galleryRepository.findAll(includeArchived);
  }

  public async updateImage(id: string, data: UpdateGalleryImageData): Promise<GalleryImage> {
    await this.getImageById(id);
    return this.galleryRepository.update(id, data);
  }

  public async archiveImage(id: string): Promise<GalleryImage> {
    await this.getImageById(id);
    return this.galleryRepository.archive(id);
  }

  public async deleteImage(id: string): Promise<GalleryImage> {
    await this.getImageById(id);
    return this.galleryRepository.delete(id);
  }
}

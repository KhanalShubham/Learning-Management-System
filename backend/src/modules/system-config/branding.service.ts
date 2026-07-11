import { SchoolBranding, Prisma } from '@prisma/client';
import { IBrandingRepository } from './branding.repository';

export type BrandingImageField =
  | 'logoUrl'
  | 'faviconUrl'
  | 'stampUrl'
  | 'principalSignatureUrl'
  | 'reportHeaderImageUrl'
  | 'reportFooterImageUrl'
  | 'coverImageUrl';

export class BrandingService {
  constructor(private brandingRepository: IBrandingRepository) {}

  public async getBranding(): Promise<SchoolBranding> {
    return this.brandingRepository.getOrCreate();
  }

  public async updateBranding(data: Prisma.SchoolBrandingUpdateInput): Promise<SchoolBranding> {
    const branding = await this.brandingRepository.getOrCreate();
    return this.brandingRepository.update(branding.id, data);
  }

  public async updateImage(field: BrandingImageField, url: string): Promise<SchoolBranding> {
    const branding = await this.brandingRepository.getOrCreate();
    return this.brandingRepository.update(branding.id, { [field]: url });
  }
}

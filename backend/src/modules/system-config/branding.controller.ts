import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { AppError } from '@/middleware/error.middleware';
import { uploadImageBuffer } from '@/config/cloudinary';
import { BrandingRepository } from './branding.repository';
import { BrandingService, BrandingImageField } from './branding.service';
import { updateBrandingSchema } from './branding.validator';

const brandingRepository = new BrandingRepository();
const brandingService = new BrandingService(brandingRepository);

export class BrandingController {
  public getBranding = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branding = await brandingService.getBranding();
      return successResponse(res, 'Branding retrieved successfully.', { branding });
    } catch (error) {
      next(error);
    }
  };

  public updateBranding = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = updateBrandingSchema.parse(req.body);
      const branding = await brandingService.updateBranding(validated);
      return successResponse(res, 'Branding updated successfully.', { branding });
    } catch (error) {
      next(error);
    }
  };

  private handleImageUpload = (field: BrandingImageField, folder: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.file) {
          throw new AppError('No image file was provided', 400);
        }
        const url = await uploadImageBuffer(req.file.buffer, folder);
        const branding = await brandingService.updateImage(field, url);
        return successResponse(res, 'Image uploaded successfully.', { branding });
      } catch (error) {
        next(error);
      }
    };
  };

  public uploadLogo = this.handleImageUpload('logoUrl', 'school/logo');
  public uploadFavicon = this.handleImageUpload('faviconUrl', 'school/favicon');
  public uploadStamp = this.handleImageUpload('stampUrl', 'school/stamp');
  public uploadSignature = this.handleImageUpload('principalSignatureUrl', 'school/signature');
  public uploadReportHeader = this.handleImageUpload('reportHeaderImageUrl', 'school/report-header');
  public uploadReportFooter = this.handleImageUpload('reportFooterImageUrl', 'school/report-footer');
}

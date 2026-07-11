import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { writeAuditLog } from '@/utils/audit-log';
import { AppError } from '@/middleware/error.middleware';
import { uploadImageBuffer } from '@/config/cloudinary';
import { GalleryRepository } from './gallery.repository';
import { GalleryService } from './gallery.service';
import {
  galleryIdParamSchema,
  listGalleryQuerySchema,
  addGalleryImageSchema,
  updateGalleryImageSchema,
} from './gallery.validator';

const auditContext = (req: Request) => ({
  userId: req.user?.id,
  email: req.user?.email,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});

const galleryRepository = new GalleryRepository();
const galleryService = new GalleryService(galleryRepository);

export class GalleryController {
  // Public — no auth.
  public getPublishedImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const images = await galleryService.getAllImages(false);
      return successResponse(res, 'Gallery images retrieved successfully.', { images });
    } catch (error) {
      next(error);
    }
  };

  // Generic upload plumbing (no DB write) — mirrors the photo-upload pattern
  // used by Students/Teachers.
  public uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }
      const imageUrl = await uploadImageBuffer(req.file.buffer, 'gallery');
      return successResponse(res, 'Image uploaded successfully.', { imageUrl });
    } catch (error) {
      next(error);
    }
  };

  // Admin — requires cms.edit / cms.publish (see gallery.routes.ts).
  public addImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = addGalleryImageSchema.parse(req.body);
      const image = await galleryService.addImage(validated);
      await writeAuditLog({
        ...auditContext(req),
        action: 'GALLERY_IMAGE_ADDED',
        entityType: 'gallery-image',
        entityId: image.id,
        details: `Added gallery image ${image.id}`,
      });
      return successResponse(res, 'Image added successfully.', { image }, 201);
    } catch (error) {
      next(error);
    }
  };

  public getAllImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { includeArchived } = listGalleryQuerySchema.parse(req.query);
      const images = await galleryService.getAllImages(includeArchived);
      return successResponse(res, 'Gallery images retrieved successfully.', { images });
    } catch (error) {
      next(error);
    }
  };

  public updateImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = galleryIdParamSchema.parse(req.params);
      const validated = updateGalleryImageSchema.parse(req.body);
      const image = await galleryService.updateImage(id, validated);
      return successResponse(res, 'Image updated successfully.', { image });
    } catch (error) {
      next(error);
    }
  };

  public archiveImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = galleryIdParamSchema.parse(req.params);
      const image = await galleryService.archiveImage(id);
      await writeAuditLog({
        ...auditContext(req),
        action: 'GALLERY_IMAGE_REMOVED',
        entityType: 'gallery-image',
        entityId: id,
        details: `Archived gallery image ${id}`,
      });
      return successResponse(res, 'Image archived successfully.', { image });
    } catch (error) {
      next(error);
    }
  };

  public deleteImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = galleryIdParamSchema.parse(req.params);
      const image = await galleryService.deleteImage(id);
      await writeAuditLog({
        ...auditContext(req),
        action: 'GALLERY_IMAGE_REMOVED',
        entityType: 'gallery-image',
        entityId: id,
        details: `Deleted gallery image ${id}`,
      });
      return successResponse(res, 'Image deleted successfully.', { image });
    } catch (error) {
      next(error);
    }
  };
}

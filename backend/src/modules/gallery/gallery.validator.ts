import { z } from 'zod';

export const galleryIdParamSchema = z.object({
  id: z.string().uuid('Invalid Gallery Image ID'),
});

export const listGalleryQuerySchema = z.object({
  includeArchived: z.coerce.boolean().optional().default(false),
});

export const addGalleryImageSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  caption: z.string().optional(),
});

export const updateGalleryImageSchema = z.object({
  caption: z.string().optional(),
  displayOrder: z.coerce.number().int().optional(),
});

import { z } from 'zod';

export const designationIdParamSchema = z.object({
  id: z.string().uuid('Invalid Designation ID'),
});

export const listDesignationsQuerySchema = z.object({
  includeArchived: z.coerce.boolean().optional().default(false),
});

export const createDesignationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  displayOrder: z.coerce.number().int().positive(),
  description: z.string().optional(),
});

export const updateDesignationSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  displayOrder: z.coerce.number().int().positive().optional(),
  description: z.string().nullable().optional(),
});

import { z } from 'zod';

export const classIdParamSchema = z.object({
  id: z.string().uuid('Invalid Class ID'),
});

export const listClassesQuerySchema = z.object({
  academicYearId: z.string().uuid('Invalid Academic Year ID').optional(),
  includeArchived: z.coerce.boolean().optional().default(false),
});

export const createClassSchema = z.object({
  academicYearId: z.string().uuid('Invalid Academic Year ID'),
  name: z.string().min(1, 'Name is required'),
  displayOrder: z.coerce.number().int(),
  description: z.string().optional(),
});

export const updateClassSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  displayOrder: z.coerce.number().int().optional(),
  description: z.string().nullable().optional(),
});

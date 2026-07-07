import { z } from 'zod';

export const academicTermIdParamSchema = z.object({
  id: z.string().uuid('Invalid Academic Term ID'),
});

export const createAcademicTermSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  order: z.coerce.number().int().min(0),
});

export const updateAcademicTermSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  order: z.coerce.number().int().min(0).optional(),
});

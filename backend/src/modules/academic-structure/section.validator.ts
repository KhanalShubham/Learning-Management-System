import { z } from 'zod';

export const sectionIdParamSchema = z.object({
  id: z.string().uuid('Invalid Section ID'),
});

export const listSectionsQuerySchema = z.object({
  classId: z.string().uuid('Invalid Class ID').optional(),
  includeArchived: z.coerce.boolean().optional().default(false),
});

export const createSectionSchema = z.object({
  classId: z.string().uuid('Invalid Class ID'),
  name: z.string().min(1, 'Name is required'),
  capacity: z.coerce.number().int().positive().optional(),
  roomNumber: z.string().optional(),
});

export const updateSectionSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  capacity: z.coerce.number().int().positive().nullable().optional(),
  roomNumber: z.string().nullable().optional(),
});

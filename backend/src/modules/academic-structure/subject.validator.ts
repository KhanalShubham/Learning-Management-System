import { z } from 'zod';

export const subjectIdParamSchema = z.object({
  id: z.string().uuid('Invalid Subject ID'),
});

export const listSubjectsQuerySchema = z.object({
  includeArchived: z.coerce.boolean().optional().default(false),
});

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1).optional(),
  description: z.string().optional(),
  isOptional: z.coerce.boolean().optional().default(false),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  code: z.string().min(1).nullable().optional(),
  description: z.string().nullable().optional(),
  isOptional: z.coerce.boolean().optional(),
});

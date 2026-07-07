import { z } from 'zod';

export const examTypeIdParamSchema = z.object({
  id: z.string().uuid('Invalid Exam Type ID'),
});

export const listExamTypesQuerySchema = z.object({
  academicYearId: z.string().uuid('Invalid Academic Year ID').optional(),
  includeArchived: z.coerce.boolean().optional().default(false),
});

export const createExamTypeSchema = z.object({
  academicYearId: z.string().uuid('Invalid Academic Year ID'),
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  displayOrder: z.coerce.number().int(),
  weightage: z.coerce.number().positive(),
  isPublished: z.coerce.boolean().optional().default(false),
});

export const updateExamTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  displayOrder: z.coerce.number().int().optional(),
  weightage: z.coerce.number().positive().optional(),
  isPublished: z.coerce.boolean().optional(),
});

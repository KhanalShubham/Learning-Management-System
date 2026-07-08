import { z } from 'zod';

export const departmentIdParamSchema = z.object({
  id: z.string().uuid('Invalid Department ID'),
});

export const listDepartmentsQuerySchema = z.object({
  includeArchived: z.coerce.boolean().optional().default(false),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  code: z.string().min(1).nullable().optional(),
  description: z.string().nullable().optional(),
});

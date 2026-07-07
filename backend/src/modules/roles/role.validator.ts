import { z } from 'zod';

export const roleIdParamSchema = z.object({
  id: z.string().uuid('Invalid Role ID'),
});

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name is required'),
  description: z.string().optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2, 'Role name is required').optional(),
  description: z.string().optional(),
});

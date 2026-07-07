import { z } from 'zod';

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid User ID'),
});

export const listUsersQuerySchema = z.object({
  skip: z.coerce.number().int().min(0).optional().default(0),
  take: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(2, 'Full name is required'),
  roleId: z.string().uuid('Invalid Role ID'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address format').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
  fullName: z.string().min(2, 'Full name is required').optional(),
  roleId: z.string().uuid('Invalid Role ID').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

import { z } from 'zod';

export const leadershipRoleParamSchema = z.object({
  role: z.enum(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMINISTRATOR', 'ACCOUNT_OFFICER']),
});

export const updateLeadershipSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  designation: z.string().optional().or(z.literal('')),
});

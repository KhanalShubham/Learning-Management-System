import { z } from 'zod';

export const updateSettingsSchema = z.object({
  timezone: z.string().optional(),
  language: z.string().optional(),
  currency: z.string().optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.string().optional(),
  weekStartsOn: z.coerce.number().int().min(0).max(6).optional(),
  defaultPassword: z.string().min(6, 'Default password must be at least 6 characters').optional(),
  attendanceMethod: z.enum(['ADMIN_ONLY', 'TEACHER', 'BIOMETRIC']).optional(),
});

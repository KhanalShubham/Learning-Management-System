import { z } from 'zod';

export const academicYearIdParamSchema = z.object({
  id: z.string().uuid('Invalid Academic Year ID'),
});

export const createAcademicYearSchema = z
  .object({
    label: z.string().min(2, 'Label is required'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'Start date must be before end date',
    path: ['endDate'],
  });

export const updateAcademicYearSchema = z
  .object({
    label: z.string().min(2, 'Label is required').optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.startDate < data.endDate, {
    message: 'Start date must be before end date',
    path: ['endDate'],
  });
